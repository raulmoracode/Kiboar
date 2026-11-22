use thiserror::Error;

use crate::device::{BoardInfo, MatrixSize};

/// HID feature report the firmware exposes for board identity. The report id is
/// part of the HIDAPI buffer; the payload is always `PAYLOAD_LEN` bytes.
pub const REPORT_ID: u8 = 0x10;
pub const INFO_VERSION: u8 = 1;
pub const PAYLOAD_LEN: usize = 32;

const BOARD_ID_LEN: usize = 16;
const CRC_COVERED: usize = 30;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum ProtocolError {
    #[error("expected {PAYLOAD_LEN} payload bytes, received {0}")]
    WrongLength(usize),
    #[error("unsupported board info version {0}")]
    UnsupportedVersion(u8),
    #[error("board id is empty")]
    EmptyBoardId,
    #[error("board id is not a lowercase slug")]
    InvalidBoardId,
    #[error("matrix size must be non-zero")]
    InvalidMatrix,
    #[error("checksum mismatch: expected {expected:#06x}, received {actual:#06x}")]
    BadChecksum { expected: u16, actual: u16 },
}

/// Parse the payload of a Kiboar board info feature report.
///
/// Layout, all little-endian where it matters:
///
/// ```text
/// 0      info version (1)
/// 1..17  board id, ASCII, NUL padded (16 bytes)
/// 17     hardware revision
/// 18..21 firmware major, minor, patch
/// 21..25 serial number, u32 LE
/// 25     matrix rows
/// 26     matrix columns
/// 27     layer count
/// 28     flags: bit 0 = split
/// 29     reserved, must be 0
/// 30..32 CRC16-CCITT of bytes 0..30, u16 LE
/// ```
pub fn parse_board_info(payload: &[u8]) -> Result<BoardInfo, ProtocolError> {
    if payload.len() != PAYLOAD_LEN {
        return Err(ProtocolError::WrongLength(payload.len()));
    }
    if payload[0] != INFO_VERSION {
        return Err(ProtocolError::UnsupportedVersion(payload[0]));
    }
    if payload[29] != 0 {
        return Err(ProtocolError::InvalidBoardId);
    }

    let raw_board_id = &payload[1..1 + BOARD_ID_LEN];
    let end = raw_board_id
        .iter()
        .position(|byte| *byte == 0)
        .unwrap_or(BOARD_ID_LEN);
    if end == 0 {
        return Err(ProtocolError::EmptyBoardId);
    }
    if raw_board_id[end..].iter().any(|byte| *byte != 0) {
        return Err(ProtocolError::InvalidBoardId);
    }
    let board_id =
        std::str::from_utf8(&raw_board_id[..end]).map_err(|_| ProtocolError::InvalidBoardId)?;
    if !is_lowercase_slug(board_id) {
        return Err(ProtocolError::InvalidBoardId);
    }

    let rows = payload[25];
    let cols = payload[26];
    if rows == 0 || cols == 0 {
        return Err(ProtocolError::InvalidMatrix);
    }

    let expected = crc16_ccitt(&payload[..CRC_COVERED]);
    let actual = u16::from_le_bytes([payload[30], payload[31]]);
    if expected != actual {
        return Err(ProtocolError::BadChecksum { expected, actual });
    }

    Ok(BoardInfo {
        board_id: board_id.to_owned(),
        hw_rev: payload[17],
        fw_version: format!("{}.{}.{}", payload[18], payload[19], payload[20]),
        protocol_version: INFO_VERSION,
        serial: u32::from_le_bytes([payload[21], payload[22], payload[23], payload[24]]),
        matrix: MatrixSize { rows, cols },
        layers: payload[27],
        split: payload[28] & 1 != 0,
    })
}

fn is_lowercase_slug(value: &str) -> bool {
    let bytes = value.as_bytes();
    if bytes.len() < 2 || bytes.len() > BOARD_ID_LEN {
        return false;
    }
    let first = bytes[0];
    if !first.is_ascii_lowercase() && !first.is_ascii_digit() {
        return false;
    }
    bytes
        .iter()
        .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || *byte == b'-')
}

/// CRC16-CCITT (poly 0x1021, init 0xFFFF), the check used by the report.
pub fn crc16_ccitt(bytes: &[u8]) -> u16 {
    let mut crc: u16 = 0xFFFF;
    for byte in bytes {
        crc ^= u16::from(*byte) << 8;
        for _ in 0..8 {
            crc = if crc & 0x8000 != 0 {
                (crc << 1) ^ 0x1021
            } else {
                crc << 1
            };
        }
    }
    crc
}

#[cfg(test)]
mod tests {
    use super::*;

    // The helper mirrors the wire layout field by field, so the call sites read
    // like the report they build.
    #[allow(clippy::too_many_arguments)]
    fn encode(
        board_id: &str,
        hw_rev: u8,
        fw: (u8, u8, u8),
        serial: u32,
        rows: u8,
        cols: u8,
        layers: u8,
        split: bool,
    ) -> [u8; PAYLOAD_LEN] {
        let mut payload = [0u8; PAYLOAD_LEN];
        payload[0] = INFO_VERSION;
        let id = board_id.as_bytes();
        payload[1..1 + id.len()].copy_from_slice(id);
        payload[17] = hw_rev;
        payload[18] = fw.0;
        payload[19] = fw.1;
        payload[20] = fw.2;
        payload[21..25].copy_from_slice(&serial.to_le_bytes());
        payload[25] = rows;
        payload[26] = cols;
        payload[27] = layers;
        payload[28] = u8::from(split);
        payload[29] = 0;
        let crc = crc16_ccitt(&payload[..CRC_COVERED]);
        payload[30..32].copy_from_slice(&crc.to_le_bytes());
        payload
    }

    #[test]
    fn crc16_matches_the_ccitt_check_value() {
        assert_eq!(crc16_ccitt(b"123456789"), 0x29B1);
    }

    #[test]
    fn parses_a_valid_report() {
        let payload = encode("kb60-hhkb", 1, (1, 2, 3), 42, 5, 14, 4, true);
        let info = parse_board_info(&payload).expect("valid report");

        assert_eq!(info.board_id, "kb60-hhkb");
        assert_eq!(info.hw_rev, 1);
        assert_eq!(info.fw_version, "1.2.3");
        assert_eq!(info.protocol_version, INFO_VERSION);
        assert_eq!(info.serial, 42);
        assert_eq!(info.matrix, MatrixSize { rows: 5, cols: 14 });
        assert_eq!(info.layers, 4);
        assert!(info.split);
    }

    #[test]
    fn rejects_a_short_report() {
        assert_eq!(
            parse_board_info(&[0u8; PAYLOAD_LEN - 1]),
            Err(ProtocolError::WrongLength(PAYLOAD_LEN - 1))
        );
    }

    #[test]
    fn rejects_a_long_report() {
        assert_eq!(
            parse_board_info(&[0u8; PAYLOAD_LEN + 1]),
            Err(ProtocolError::WrongLength(PAYLOAD_LEN + 1))
        );
    }

    #[test]
    fn rejects_an_unsupported_version() {
        let mut payload = encode("kb60-hhkb", 1, (1, 0, 0), 1, 1, 1, 1, false);
        payload[0] = 2;
        assert_eq!(
            parse_board_info(&payload),
            Err(ProtocolError::UnsupportedVersion(2))
        );
    }

    #[test]
    fn rejects_an_empty_board_id() {
        let mut payload = encode("kb60-hhkb", 1, (1, 0, 0), 1, 1, 1, 1, false);
        payload[1..17].fill(0);
        assert_eq!(parse_board_info(&payload), Err(ProtocolError::EmptyBoardId));
    }

    #[test]
    fn rejects_an_uppercase_board_id() {
        let mut payload = encode("kb60-hhkb", 1, (1, 0, 0), 1, 1, 1, 1, false);
        payload[1] = b'K';
        assert_eq!(
            parse_board_info(&payload),
            Err(ProtocolError::InvalidBoardId)
        );
    }

    #[test]
    fn rejects_bytes_after_the_nul_padding() {
        let mut payload = encode("ab", 1, (1, 0, 0), 1, 1, 1, 1, false);
        payload[4] = b'x';
        assert_eq!(
            parse_board_info(&payload),
            Err(ProtocolError::InvalidBoardId)
        );
    }

    #[test]
    fn rejects_a_zero_matrix() {
        let mut payload = encode("kb60-hhkb", 1, (1, 0, 0), 1, 1, 1, 1, false);
        payload[25] = 0;
        assert_eq!(
            parse_board_info(&payload),
            Err(ProtocolError::InvalidMatrix)
        );
    }

    #[test]
    fn rejects_a_bad_checksum() {
        let mut payload = encode("kb60-hhkb", 1, (1, 0, 0), 1, 1, 1, 1, false);
        payload[31] ^= 0xFF;
        assert!(matches!(
            parse_board_info(&payload),
            Err(ProtocolError::BadChecksum { .. })
        ));
    }
}
