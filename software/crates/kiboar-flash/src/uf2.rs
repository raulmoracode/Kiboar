use std::collections::BTreeSet;

use thiserror::Error;

/// UF2 blocks are exactly 512 bytes.
pub const BLOCK_SIZE: usize = 512;
/// Payload bytes available in each block.
pub const DATA_SIZE: usize = 476;
const DATA_OFFSET: usize = 32;

pub const MAGIC_START0: u32 = 0x0A32_4655;
pub const MAGIC_START1: u32 = 0x9E5D_5157;
pub const MAGIC_END: u32 = 0x0AB1_6F30;

pub const FLAG_NOT_MAIN_FLASH: u32 = 0x0000_0001;
pub const FLAG_FILE_CONTAINER: u32 = 0x0000_0002;
pub const FLAG_FAMILY_ID_PRESENT: u32 = 0x0000_2000;

/// Family id of the RP2040 flash, as written by the UF2 converter.
pub const RP2040_FAMILY_ID: u32 = 0xE48B_FF56;

/// Start of the RP2040 XIP flash window.
pub const RP2040_FLASH_START: u32 = 0x1000_0000;
/// End of the 16 MiB RP2040 XIP flash window.
pub const RP2040_FLASH_END: u32 = 0x1100_0000;

/// One 512-byte UF2 block, reduced to the fields the application uses.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Uf2Block {
    pub block_no: u32,
    pub target_addr: u32,
    pub flags: u32,
    pub family_id: Option<u32>,
    pub payload: Vec<u8>,
}

/// A parsed firmware artefact.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Uf2 {
    blocks: Vec<Uf2Block>,
    family_id: Option<u32>,
}

impl Uf2 {
    /// Parse a UF2 file and validate its block structure.
    ///
    /// This checks the format, not the destination: call
    /// [`Uf2::validate_for_family`] with the MCU family detected over USB
    /// before writing anything.
    pub fn parse(bytes: &[u8]) -> Result<Self, Uf2Error> {
        if bytes.is_empty() {
            return Err(Uf2Error::Empty);
        }
        if !bytes.len().is_multiple_of(BLOCK_SIZE) {
            return Err(Uf2Error::NotBlockAligned { len: bytes.len() });
        }

        let mut blocks = Vec::with_capacity(bytes.len() / BLOCK_SIZE);
        let mut expected_blocks: Option<u32> = None;
        let mut family_id: Option<u32> = None;
        let mut seen = BTreeSet::new();

        for (index, raw) in bytes.as_chunks::<BLOCK_SIZE>().0.iter().enumerate() {
            if read_u32(raw, 0) != MAGIC_START0 || read_u32(raw, 4) != MAGIC_START1 {
                return Err(Uf2Error::BadStartMagic { index });
            }
            if read_u32(raw, BLOCK_SIZE - 4) != MAGIC_END {
                return Err(Uf2Error::BadEndMagic { index });
            }

            let flags = read_u32(raw, 8);
            let target_addr = read_u32(raw, 12);
            let payload_size = read_u32(raw, 16);
            let block_no = read_u32(raw, 20);
            let num_blocks = read_u32(raw, 24);

            if payload_size as usize > DATA_SIZE {
                return Err(Uf2Error::PayloadTooLarge {
                    index,
                    size: payload_size,
                });
            }
            if num_blocks == 0 {
                return Err(Uf2Error::BlockCountZero { index });
            }
            match expected_blocks {
                Some(expected) if expected != num_blocks => {
                    return Err(Uf2Error::BlockCountMismatch {
                        index,
                        expected,
                        found: num_blocks,
                    });
                }
                Some(_) => {}
                None => expected_blocks = Some(num_blocks),
            }
            if block_no >= num_blocks {
                return Err(Uf2Error::BlockOutOfRange {
                    index,
                    number: block_no,
                    total: num_blocks,
                });
            }
            if !seen.insert(block_no) {
                return Err(Uf2Error::DuplicateBlock {
                    index,
                    number: block_no,
                });
            }

            let block_family = if flags & FLAG_FAMILY_ID_PRESENT != 0 {
                let value = read_u32(raw, 28);
                match family_id {
                    Some(first) if first != value => {
                        return Err(Uf2Error::FamilyIdConflict {
                            first,
                            other: value,
                        });
                    }
                    Some(_) => {}
                    None => family_id = Some(value),
                }
                Some(value)
            } else {
                None
            };

            let payload = raw[DATA_OFFSET..DATA_OFFSET + payload_size as usize].to_vec();
            blocks.push(Uf2Block {
                block_no,
                target_addr,
                flags,
                family_id: block_family,
                payload,
            });
        }

        let total = expected_blocks.unwrap_or(0);
        if blocks.len() != total as usize {
            let mut expected = 0u32;
            let mut missing = None;
            for number in &seen {
                if *number != expected {
                    missing = Some(expected);
                    break;
                }
                expected += 1;
            }
            return Err(Uf2Error::MissingBlock {
                number: missing.unwrap_or(expected),
            });
        }

        Ok(Self { blocks, family_id })
    }

    /// Blocks in the order they appeared in the file.
    pub fn blocks(&self) -> &[Uf2Block] {
        &self.blocks
    }

    /// Number of blocks the artefact declares.
    pub fn block_count(&self) -> usize {
        self.blocks.len()
    }

    /// Family id declared by the blocks, when they agree.
    pub fn family_id(&self) -> Option<u32> {
        self.family_id
    }

    /// Sum of the payload bytes carried by the blocks.
    pub fn payload_size(&self) -> usize {
        self.blocks.iter().map(|block| block.payload.len()).sum()
    }

    /// Check that every block targets `expected` and can be written to main
    /// flash.
    pub fn validate_for_family(&self, expected: u32) -> Result<(), Uf2Error> {
        for block in &self.blocks {
            match block.family_id {
                Some(actual) if actual == expected => {}
                Some(actual) => {
                    return Err(Uf2Error::FamilyMismatch { expected, actual });
                }
                None => {
                    return Err(Uf2Error::MissingFamilyId {
                        number: block.block_no,
                    });
                }
            }
            if block.flags & FLAG_NOT_MAIN_FLASH != 0 {
                return Err(Uf2Error::NotMainFlash {
                    number: block.block_no,
                });
            }
            if block.flags & FLAG_FILE_CONTAINER != 0 {
                return Err(Uf2Error::FileContainer {
                    number: block.block_no,
                });
            }
        }

        let mut ranges = Vec::with_capacity(self.blocks.len());
        for block in &self.blocks {
            let start = block.target_addr;
            let end = start.checked_add(block.payload.len() as u32).ok_or(
                Uf2Error::AddressOutOfRange {
                    number: block.block_no,
                    address: start,
                },
            )?;
            if expected == RP2040_FAMILY_ID
                && (start < RP2040_FLASH_START || end > RP2040_FLASH_END)
            {
                return Err(Uf2Error::AddressOutOfRange {
                    number: block.block_no,
                    address: start,
                });
            }
            ranges.push((start, end, block.block_no));
        }

        ranges.sort_unstable();
        for pair in ranges.windows(2) {
            if pair[1].0 < pair[0].1 {
                return Err(Uf2Error::OverlappingBlocks {
                    number: pair[1].2,
                    address: pair[1].0,
                });
            }
        }

        Ok(())
    }
}

fn read_u32(bytes: &[u8], offset: usize) -> u32 {
    u32::from_le_bytes(
        bytes[offset..offset + 4]
            .try_into()
            .expect("UF2 field is four bytes"),
    )
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum Uf2Error {
    #[error("the artefact is empty")]
    Empty,
    #[error("the artefact is {len} bytes, not a multiple of the 512-byte UF2 block")]
    NotBlockAligned { len: usize },
    #[error("block {index} has an invalid start magic")]
    BadStartMagic { index: usize },
    #[error("block {index} has an invalid end magic")]
    BadEndMagic { index: usize },
    #[error("block {index} declares {size} payload bytes; the maximum is {DATA_SIZE}")]
    PayloadTooLarge { index: usize, size: u32 },
    #[error("block {index} declares zero blocks")]
    BlockCountZero { index: usize },
    #[error("block {index} has number {number}, outside 0..{total}")]
    BlockOutOfRange {
        index: usize,
        number: u32,
        total: u32,
    },
    #[error("block {index} repeats block number {number}")]
    DuplicateBlock { index: usize, number: u32 },
    #[error("block {index} declares {found} blocks; the first block declares {expected}")]
    BlockCountMismatch {
        index: usize,
        expected: u32,
        found: u32,
    },
    #[error("block number {number} is missing")]
    MissingBlock { number: u32 },
    #[error("blocks disagree on the family id: {first:#010x} and {other:#010x}")]
    FamilyIdConflict { first: u32, other: u32 },
    #[error("block {number} does not declare an MCU family id")]
    MissingFamilyId { number: u32 },
    #[error("the artefact is for family {actual:#010x}, not {expected:#010x}")]
    FamilyMismatch { expected: u32, actual: u32 },
    #[error("block {number} is not main flash")]
    NotMainFlash { number: u32 },
    #[error("block {number} is a file container, not a flash image")]
    FileContainer { number: u32 },
    #[error("block {number} targets {address:#010x}, outside the RP2040 flash window")]
    AddressOutOfRange { number: u32, address: u32 },
    #[error("block {number} at {address:#010x} overlaps the previous block")]
    OverlappingBlocks { number: u32, address: u32 },
}

#[cfg(test)]
mod tests {
    use super::*;

    fn block(number: u32, total: u32, family: Option<u32>, payload: &[u8]) -> [u8; BLOCK_SIZE] {
        assert!(payload.len() <= DATA_SIZE);
        let mut raw = [0u8; BLOCK_SIZE];
        raw[0..4].copy_from_slice(&MAGIC_START0.to_le_bytes());
        raw[4..8].copy_from_slice(&MAGIC_START1.to_le_bytes());
        let mut flags = 0;
        if family.is_some() {
            flags |= FLAG_FAMILY_ID_PRESENT;
        }
        raw[8..12].copy_from_slice(&flags.to_le_bytes());
        raw[12..16].copy_from_slice(&(RP2040_FLASH_START + number * 256).to_le_bytes());
        raw[16..20].copy_from_slice(&(payload.len() as u32).to_le_bytes());
        raw[20..24].copy_from_slice(&number.to_le_bytes());
        raw[24..28].copy_from_slice(&total.to_le_bytes());
        raw[28..32].copy_from_slice(&family.unwrap_or(payload.len() as u32).to_le_bytes());
        raw[DATA_OFFSET..DATA_OFFSET + payload.len()].copy_from_slice(payload);
        raw[BLOCK_SIZE - 4..].copy_from_slice(&MAGIC_END.to_le_bytes());
        raw
    }

    fn artefact(blocks: &[[u8; BLOCK_SIZE]]) -> Vec<u8> {
        blocks
            .iter()
            .flat_map(|block| block.iter().copied())
            .collect()
    }

    fn two_blocks() -> Vec<u8> {
        artefact(&[
            block(0, 2, Some(RP2040_FAMILY_ID), b"firmware"),
            block(1, 2, Some(RP2040_FAMILY_ID), b"tail"),
        ])
    }

    #[test]
    fn accepts_a_valid_artefact() {
        let uf2 = Uf2::parse(&two_blocks()).unwrap();
        assert_eq!(uf2.block_count(), 2);
        assert_eq!(uf2.family_id(), Some(RP2040_FAMILY_ID));
        assert_eq!(uf2.payload_size(), 12);
        assert!(uf2.validate_for_family(RP2040_FAMILY_ID).is_ok());
    }

    #[test]
    fn accepts_blocks_in_any_order() {
        let bytes = artefact(&[
            block(1, 2, Some(RP2040_FAMILY_ID), b"tail"),
            block(0, 2, Some(RP2040_FAMILY_ID), b"firmware"),
        ]);
        let uf2 = Uf2::parse(&bytes).unwrap();
        assert_eq!(uf2.blocks()[0].block_no, 1);
        assert_eq!(uf2.blocks()[1].block_no, 0);
    }

    #[test]
    fn rejects_an_empty_artefact() {
        assert_eq!(Uf2::parse(&[]), Err(Uf2Error::Empty));
    }

    #[test]
    fn rejects_a_partial_block() {
        assert_eq!(
            Uf2::parse(&[0u8; 100]),
            Err(Uf2Error::NotBlockAligned { len: 100 })
        );
    }

    #[test]
    fn rejects_a_bad_start_magic() {
        let mut bytes = two_blocks();
        bytes[0] = 0;
        assert_eq!(
            Uf2::parse(&bytes),
            Err(Uf2Error::BadStartMagic { index: 0 })
        );
    }

    #[test]
    fn rejects_a_bad_end_magic() {
        let mut bytes = two_blocks();
        bytes[BLOCK_SIZE - 1] = 0;
        assert_eq!(Uf2::parse(&bytes), Err(Uf2Error::BadEndMagic { index: 0 }));
    }

    #[test]
    fn rejects_a_payload_larger_than_the_block() {
        let mut raw = block(0, 1, Some(RP2040_FAMILY_ID), b"x");
        raw[16..20].copy_from_slice(&(DATA_SIZE as u32 + 1).to_le_bytes());
        assert_eq!(
            Uf2::parse(&raw),
            Err(Uf2Error::PayloadTooLarge {
                index: 0,
                size: DATA_SIZE as u32 + 1
            })
        );
    }

    #[test]
    fn rejects_zero_blocks() {
        let raw = block(0, 0, Some(RP2040_FAMILY_ID), b"x");
        assert_eq!(Uf2::parse(&raw), Err(Uf2Error::BlockCountZero { index: 0 }));
    }

    #[test]
    fn rejects_a_block_number_out_of_range() {
        let mut raw = block(0, 1, Some(RP2040_FAMILY_ID), b"x");
        raw[20..24].copy_from_slice(&1u32.to_le_bytes());
        assert_eq!(
            Uf2::parse(&raw),
            Err(Uf2Error::BlockOutOfRange {
                index: 0,
                number: 1,
                total: 1
            })
        );
    }

    #[test]
    fn rejects_a_duplicate_block_number() {
        let bytes = artefact(&[
            block(0, 2, Some(RP2040_FAMILY_ID), b"a"),
            block(0, 2, Some(RP2040_FAMILY_ID), b"b"),
        ]);
        assert_eq!(
            Uf2::parse(&bytes),
            Err(Uf2Error::DuplicateBlock {
                index: 1,
                number: 0
            })
        );
    }

    #[test]
    fn rejects_a_missing_block() {
        let bytes = artefact(&[
            block(0, 3, Some(RP2040_FAMILY_ID), b"a"),
            block(2, 3, Some(RP2040_FAMILY_ID), b"c"),
        ]);
        assert_eq!(
            Uf2::parse(&bytes),
            Err(Uf2Error::MissingBlock { number: 1 })
        );
    }

    #[test]
    fn rejects_an_inconsistent_block_count() {
        let bytes = artefact(&[
            block(0, 2, Some(RP2040_FAMILY_ID), b"a"),
            block(1, 3, Some(RP2040_FAMILY_ID), b"b"),
        ]);
        assert_eq!(
            Uf2::parse(&bytes),
            Err(Uf2Error::BlockCountMismatch {
                index: 1,
                expected: 2,
                found: 3
            })
        );
    }

    #[test]
    fn rejects_two_family_ids() {
        let bytes = artefact(&[
            block(0, 2, Some(RP2040_FAMILY_ID), b"a"),
            block(1, 2, Some(0x1234_5678), b"b"),
        ]);
        assert_eq!(
            Uf2::parse(&bytes),
            Err(Uf2Error::FamilyIdConflict {
                first: RP2040_FAMILY_ID,
                other: 0x1234_5678
            })
        );
    }

    #[test]
    fn rejects_a_family_mismatch() {
        let uf2 = Uf2::parse(&two_blocks()).unwrap();
        assert_eq!(
            uf2.validate_for_family(0x1234_5678),
            Err(Uf2Error::FamilyMismatch {
                expected: 0x1234_5678,
                actual: RP2040_FAMILY_ID
            })
        );
    }

    #[test]
    fn rejects_a_block_without_a_family() {
        let bytes = artefact(&[
            block(0, 2, Some(RP2040_FAMILY_ID), b"a"),
            block(1, 2, None, b"b"),
        ]);
        let uf2 = Uf2::parse(&bytes).unwrap();
        assert_eq!(
            uf2.validate_for_family(RP2040_FAMILY_ID),
            Err(Uf2Error::MissingFamilyId { number: 1 })
        );
    }

    #[test]
    fn rejects_blocks_that_are_not_main_flash() {
        let mut raw = block(0, 1, Some(RP2040_FAMILY_ID), b"x");
        raw[8..12].copy_from_slice(&(FLAG_FAMILY_ID_PRESENT | FLAG_NOT_MAIN_FLASH).to_le_bytes());
        let uf2 = Uf2::parse(&raw).unwrap();
        assert_eq!(
            uf2.validate_for_family(RP2040_FAMILY_ID),
            Err(Uf2Error::NotMainFlash { number: 0 })
        );
    }

    #[test]
    fn rejects_file_containers() {
        let mut raw = block(0, 1, Some(RP2040_FAMILY_ID), b"x");
        raw[8..12].copy_from_slice(&(FLAG_FAMILY_ID_PRESENT | FLAG_FILE_CONTAINER).to_le_bytes());
        let uf2 = Uf2::parse(&raw).unwrap();
        assert_eq!(
            uf2.validate_for_family(RP2040_FAMILY_ID),
            Err(Uf2Error::FileContainer { number: 0 })
        );
    }

    fn at(mut raw: [u8; BLOCK_SIZE], address: u32) -> [u8; BLOCK_SIZE] {
        raw[12..16].copy_from_slice(&address.to_le_bytes());
        raw
    }

    #[test]
    fn rejects_a_block_outside_the_rp2040_window() {
        let raw = at(
            block(0, 1, Some(RP2040_FAMILY_ID), b"firmware"),
            0x2000_0000,
        );
        let uf2 = Uf2::parse(&raw).unwrap();
        assert_eq!(
            uf2.validate_for_family(RP2040_FAMILY_ID),
            Err(Uf2Error::AddressOutOfRange {
                number: 0,
                address: 0x2000_0000
            })
        );
    }

    #[test]
    fn rejects_a_block_that_runs_past_the_rp2040_window() {
        let start = RP2040_FLASH_END - 4;
        let raw = at(block(0, 1, Some(RP2040_FAMILY_ID), b"firmware"), start);
        let uf2 = Uf2::parse(&raw).unwrap();
        assert_eq!(
            uf2.validate_for_family(RP2040_FAMILY_ID),
            Err(Uf2Error::AddressOutOfRange {
                number: 0,
                address: start
            })
        );
    }

    #[test]
    fn rejects_overlapping_blocks() {
        let first = block(0, 2, Some(RP2040_FAMILY_ID), b"0123456789");
        let second = at(
            block(1, 2, Some(RP2040_FAMILY_ID), b"abcdefghij"),
            RP2040_FLASH_START + 5,
        );
        let uf2 = Uf2::parse(&artefact(&[first, second])).unwrap();
        assert_eq!(
            uf2.validate_for_family(RP2040_FAMILY_ID),
            Err(Uf2Error::OverlappingBlocks {
                number: 1,
                address: RP2040_FLASH_START + 5
            })
        );
    }
}
