use std::fs::{self, File};
use std::io;
use std::path::{Path, PathBuf};
use std::sync::atomic::AtomicBool;
use std::sync::Arc;

use kiboar_flash::{
    sha256_hex, verify_sha256, write_artifact, DigestError, Progress, Uf2, Uf2Error, WriteError,
    RP2040_FAMILY_ID,
};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use ts_rs::TS;

use crate::registry;

/// What the UI shows after reading a firmware file.
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/lib/bindings/")]
pub struct ArtifactInspection {
    pub path: String,
    pub size_bytes: u32,
    pub sha256: String,
    pub family_id: Option<u32>,
    pub blocks: u32,
    pub payload_bytes: u32,
}

/// A mounted bootloader volume.
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/lib/bindings/")]
pub struct VolumeInfo {
    pub path: String,
    pub name: String,
    /// True when the path comes from `KIBOAR_FLASH_VOLUME` in a debug build.
    pub is_development: bool,
}

/// Everything the UI must confirm before a write.
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/lib/bindings/")]
pub struct FlashRequest {
    pub board_id: String,
    pub hw_rev: u32,
    /// Used when the board is not in the registry.
    pub mcu: String,
    pub artifact_path: String,
    pub expected_sha256: String,
    /// Must repeat the board id; the backend enforces it.
    pub confirmation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/lib/bindings/")]
pub struct FlashOutcome {
    pub board_id: String,
    pub hw_rev: u32,
    pub volume_path: String,
    pub file_name: String,
    pub bytes_written: u32,
    pub sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/lib/bindings/")]
pub struct FlashProgress {
    pub bytes_written: u32,
    pub total_bytes: u32,
}

/// Cancellation handle shared by the flash command and the cancel command.
#[derive(Debug, Clone, Default)]
pub struct FlashState(pub Arc<AtomicBool>);

/// Read a UF2 file and describe it without writing anything.
pub fn inspect_artifact(path: &Path) -> Result<ArtifactInspection, String> {
    let bytes =
        fs::read(path).map_err(|error| format!("cannot read {}: {error}", path.display()))?;
    let uf2 = Uf2::parse(&bytes).map_err(|error| format!("invalid UF2: {error}"))?;

    Ok(ArtifactInspection {
        path: path.display().to_string(),
        size_bytes: u32::try_from(bytes.len())
            .map_err(|_| "the artefact is larger than 4 GiB".to_string())?,
        sha256: sha256_hex(&bytes),
        family_id: uf2.family_id(),
        blocks: uf2.block_count() as u32,
        payload_bytes: u32::try_from(uf2.payload_size())
            .map_err(|_| "the payload is larger than 4 GiB".to_string())?,
    })
}

/// Look for a mounted RP2040 bootloader volume.
///
/// In a debug build, `KIBOAR_FLASH_VOLUME` takes precedence so the flow can be
/// exercised against a directory. Release builds ignore the variable.
pub fn find_bootloader_volume() -> Option<VolumeInfo> {
    if let Some(path) = development_volume() {
        return Some(VolumeInfo {
            name: path
                .file_name()
                .and_then(|name| name.to_str())
                .unwrap_or("development")
                .to_string(),
            path: path.display().to_string(),
            is_development: true,
        });
    }
    find_bootloader_volume_in(&default_search_roots())
}

/// Same as [`find_bootloader_volume`] with explicit roots, for tests.
pub fn find_bootloader_volume_in(roots: &[(PathBuf, usize)]) -> Option<VolumeInfo> {
    for (root, depth) in roots {
        if let Some(mut found) = scan(root, *depth) {
            found.is_development = false;
            return Some(found);
        }
    }
    None
}

fn scan(dir: &Path, depth: usize) -> Option<VolumeInfo> {
    let entries = fs::read_dir(dir).ok()?;
    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        if is_bootloader_volume(&path) {
            return Some(VolumeInfo {
                name: path
                    .file_name()
                    .and_then(|name| name.to_str())
                    .unwrap_or("bootloader")
                    .to_string(),
                path: path.display().to_string(),
                is_development: false,
            });
        }
        if depth > 1 {
            if let Some(found) = scan(&path, depth - 1) {
                return Some(found);
            }
        }
    }
    None
}

fn is_bootloader_volume(path: &Path) -> bool {
    path.join("INFO_UF2.TXT").is_file()
        || path.file_name().and_then(|name| name.to_str()) == Some("RPI-RP2")
}

/// Write a verified artefact to a mounted bootloader volume.
///
/// The registry is the source of truth for the board and its MCU. The
/// confirmation must repeat the board id, so a UI bug cannot start a write on
/// its own. A failed or cancelled copy removes the partial file.
pub fn flash_to_volume(
    request: &FlashRequest,
    root: &Path,
    volume: &Path,
    cancel: &AtomicBool,
    on_progress: impl FnMut(Progress),
) -> Result<FlashOutcome, FlashError> {
    if request.confirmation != request.board_id {
        return Err(FlashError::ConfirmationMismatch);
    }

    let boards = registry::list_boards_in(root).map_err(FlashError::Registry)?;
    let known = boards
        .into_iter()
        .find(|board| board.board_id == request.board_id && board.hw_rev == request.hw_rev);
    let (board_id, hw_rev, mcu) = match known {
        Some(board) => (board.board_id, board.hw_rev, board.mcu),
        None => (
            request.board_id.clone(),
            request.hw_rev,
            request.mcu.clone(),
        ),
    };

    let family = family_for_mcu(&mcu).ok_or(FlashError::UnsupportedMcu(mcu))?;
    let bytes = fs::read(&request.artifact_path).map_err(FlashError::Read)?;
    let uf2 = Uf2::parse(&bytes)?;
    uf2.validate_for_family(family)?;
    verify_sha256(&bytes, &request.expected_sha256)?;

    let file_name = format!("kiboar-{board_id}-rev{hw_rev}.uf2");
    let path = volume.join(&file_name);
    let mut file = File::create(&path).map_err(FlashError::Write)?;

    let result = write_artifact(&bytes, &mut file, on_progress, cancel)
        .map_err(|error| match error {
            WriteError::Cancelled => FlashError::Cancelled,
            WriteError::Io(error) => FlashError::Write(error),
        })
        .and_then(|written| {
            file.sync_all().map_err(FlashError::Write)?;
            Ok(written)
        });

    match result {
        Ok(written) => Ok(FlashOutcome {
            board_id,
            hw_rev,
            volume_path: volume.display().to_string(),
            file_name,
            bytes_written: u32::try_from(written)
                .map_err(|_| FlashError::Write(io::Error::other("artefact larger than 4 GiB")))?,
            sha256: request.expected_sha256.to_ascii_lowercase(),
        }),
        Err(error) => {
            drop(file);
            let _ = fs::remove_file(&path);
            Err(error)
        }
    }
}

fn family_for_mcu(mcu: &str) -> Option<u32> {
    if mcu.starts_with("rp2040") {
        Some(RP2040_FAMILY_ID)
    } else {
        None
    }
}

#[cfg(debug_assertions)]
fn development_volume() -> Option<PathBuf> {
    let path = PathBuf::from(std::env::var_os("KIBOAR_FLASH_VOLUME")?);
    path.is_dir().then_some(path)
}

#[cfg(not(debug_assertions))]
fn development_volume() -> Option<PathBuf> {
    None
}

#[cfg(target_os = "macos")]
fn default_search_roots() -> Vec<(PathBuf, usize)> {
    vec![(PathBuf::from("/Volumes"), 1)]
}

#[cfg(target_os = "linux")]
fn default_search_roots() -> Vec<(PathBuf, usize)> {
    vec![
        (PathBuf::from("/media"), 2),
        (PathBuf::from("/run/media"), 2),
        (PathBuf::from("/mnt"), 1),
    ]
}

#[cfg(not(any(target_os = "macos", target_os = "linux")))]
fn default_search_roots() -> Vec<(PathBuf, usize)> {
    Vec::new()
}

#[derive(Debug, Error)]
pub enum FlashError {
    #[error("the confirmation does not match the board id")]
    ConfirmationMismatch,
    #[error("the board MCU {0} cannot be flashed")]
    UnsupportedMcu(String),
    #[error("cannot read the board registry: {0}")]
    Registry(String),
    #[error("cannot read the artefact: {0}")]
    Read(io::Error),
    #[error("cannot write the firmware: {0}")]
    Write(io::Error),
    #[error(transparent)]
    Digest(#[from] DigestError),
    #[error(transparent)]
    Uf2(#[from] Uf2Error),
    #[error("the write was cancelled")]
    Cancelled,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::Ordering;

    use kiboar_flash::{
        BLOCK_SIZE, DATA_SIZE, FLAG_FAMILY_ID_PRESENT, MAGIC_END, MAGIC_START0, MAGIC_START1,
    };

    fn repo_root() -> PathBuf {
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .and_then(Path::parent)
            .unwrap()
            .to_path_buf()
    }

    fn block(number: u32, total: u32, family: u32) -> Vec<u8> {
        let mut raw = [0u8; BLOCK_SIZE];
        raw[0..4].copy_from_slice(&MAGIC_START0.to_le_bytes());
        raw[4..8].copy_from_slice(&MAGIC_START1.to_le_bytes());
        raw[8..12].copy_from_slice(&FLAG_FAMILY_ID_PRESENT.to_le_bytes());
        raw[12..16].copy_from_slice(&(number * DATA_SIZE as u32).to_le_bytes());
        raw[16..20].copy_from_slice(&(DATA_SIZE as u32).to_le_bytes());
        raw[20..24].copy_from_slice(&number.to_le_bytes());
        raw[24..28].copy_from_slice(&total.to_le_bytes());
        raw[28..32].copy_from_slice(&family.to_le_bytes());
        raw[32..32 + DATA_SIZE].fill(0x5A);
        raw[BLOCK_SIZE - 4..].copy_from_slice(&MAGIC_END.to_le_bytes());
        raw.to_vec()
    }

    fn artefact(blocks: u32, family: u32) -> Vec<u8> {
        (0..blocks)
            .flat_map(|number| block(number, blocks, family))
            .collect()
    }

    fn request(path: &Path, bytes: &[u8]) -> FlashRequest {
        FlashRequest {
            board_id: "kb60-hhkb".to_string(),
            hw_rev: 1,
            mcu: "rp2040-zero".to_string(),
            artifact_path: path.display().to_string(),
            expected_sha256: sha256_hex(bytes),
            confirmation: "kb60-hhkb".to_string(),
        }
    }

    #[test]
    fn inspects_a_valid_uf2() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("firmware.uf2");
        let bytes = artefact(2, RP2040_FAMILY_ID);
        fs::write(&path, &bytes).unwrap();

        let inspection = inspect_artifact(&path).unwrap();
        assert_eq!(inspection.size_bytes, bytes.len() as u32);
        assert_eq!(inspection.sha256, sha256_hex(&bytes));
        assert_eq!(inspection.family_id, Some(RP2040_FAMILY_ID));
        assert_eq!(inspection.blocks, 2);
    }

    #[test]
    fn rejects_a_file_that_is_not_a_uf2() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("firmware.uf2");
        fs::write(&path, b"not a uf2").unwrap();

        let error = inspect_artifact(&path).unwrap_err();
        assert!(error.contains("invalid UF2"), "{error}");
    }

    #[test]
    fn writes_a_verified_artefact() {
        let dir = tempfile::tempdir().unwrap();
        let bytes = artefact(2, RP2040_FAMILY_ID);
        let artifact_path = dir.path().join("firmware.uf2");
        fs::write(&artifact_path, &bytes).unwrap();
        let volume = dir.path().join("RPI-RP2");
        fs::create_dir(&volume).unwrap();

        let mut progress = Vec::new();
        let outcome = flash_to_volume(
            &request(&artifact_path, &bytes),
            &repo_root(),
            &volume,
            &AtomicBool::new(false),
            |update| progress.push(update),
        )
        .unwrap();

        assert_eq!(outcome.file_name, "kiboar-kb60-hhkb-rev1.uf2");
        assert_eq!(fs::read(volume.join(&outcome.file_name)).unwrap(), bytes);
        assert_eq!(progress.last().unwrap().bytes_written, bytes.len() as u64);
    }

    #[test]
    fn rejects_a_wrong_confirmation_before_writing() {
        let dir = tempfile::tempdir().unwrap();
        let bytes = artefact(1, RP2040_FAMILY_ID);
        let artifact_path = dir.path().join("firmware.uf2");
        fs::write(&artifact_path, &bytes).unwrap();
        let mut request = request(&artifact_path, &bytes);
        request.confirmation = "another-board".to_string();

        let error = flash_to_volume(
            &request,
            &repo_root(),
            dir.path(),
            &AtomicBool::new(false),
            |_| {},
        )
        .unwrap_err();

        assert!(matches!(error, FlashError::ConfirmationMismatch));
        assert!(!dir.path().join("kiboar-kb60-hhkb-rev1.uf2").exists());
    }

    #[test]
    fn rejects_a_changed_artefact() {
        let dir = tempfile::tempdir().unwrap();
        let bytes = artefact(1, RP2040_FAMILY_ID);
        let artifact_path = dir.path().join("firmware.uf2");
        fs::write(&artifact_path, &bytes).unwrap();
        let mut request = request(&artifact_path, &bytes);
        request.expected_sha256 = "0".repeat(64);

        let error = flash_to_volume(
            &request,
            &repo_root(),
            dir.path(),
            &AtomicBool::new(false),
            |_| {},
        )
        .unwrap_err();

        assert!(matches!(error, FlashError::Digest(_)));
    }

    #[test]
    fn rejects_the_wrong_mcu_family() {
        let dir = tempfile::tempdir().unwrap();
        let bytes = artefact(1, 0x1234_5678);
        let artifact_path = dir.path().join("firmware.uf2");
        fs::write(&artifact_path, &bytes).unwrap();

        let error = flash_to_volume(
            &request(&artifact_path, &bytes),
            &repo_root(),
            dir.path(),
            &AtomicBool::new(false),
            |_| {},
        )
        .unwrap_err();

        assert!(matches!(
            error,
            FlashError::Uf2(Uf2Error::FamilyMismatch { .. })
        ));
    }

    #[test]
    fn writes_a_board_outside_the_registry() {
        let dir = tempfile::tempdir().unwrap();
        let bytes = artefact(1, RP2040_FAMILY_ID);
        let artifact_path = dir.path().join("firmware.uf2");
        fs::write(&artifact_path, &bytes).unwrap();
        let volume = dir.path().join("RPI-RP2");
        fs::create_dir(&volume).unwrap();
        let mut request = request(&artifact_path, &bytes);
        request.board_id = "custom-60".to_string();
        request.confirmation = "custom-60".to_string();

        let outcome = flash_to_volume(
            &request,
            &repo_root(),
            &volume,
            &AtomicBool::new(false),
            |_| {},
        )
        .unwrap();

        assert_eq!(outcome.board_id, "custom-60");
        assert!(volume.join("kiboar-custom-60-rev1.uf2").exists());
    }

    #[test]
    fn rejects_an_unsupported_mcu() {
        let dir = tempfile::tempdir().unwrap();
        let bytes = artefact(1, RP2040_FAMILY_ID);
        let artifact_path = dir.path().join("firmware.uf2");
        fs::write(&artifact_path, &bytes).unwrap();
        let mut request = request(&artifact_path, &bytes);
        request.board_id = "custom-60".to_string();
        request.confirmation = "custom-60".to_string();
        request.mcu = "stm32".to_string();

        let error = flash_to_volume(
            &request,
            &repo_root(),
            dir.path(),
            &AtomicBool::new(false),
            |_| {},
        )
        .unwrap_err();

        assert!(matches!(error, FlashError::UnsupportedMcu(_)));
    }

    #[test]
    fn cancellation_removes_the_partial_file() {
        let dir = tempfile::tempdir().unwrap();
        let bytes = artefact(100, RP2040_FAMILY_ID);
        let artifact_path = dir.path().join("firmware.uf2");
        fs::write(&artifact_path, &bytes).unwrap();
        let volume = dir.path().join("RPI-RP2");
        fs::create_dir(&volume).unwrap();
        let cancel = AtomicBool::new(false);

        let error = flash_to_volume(
            &request(&artifact_path, &bytes),
            &repo_root(),
            &volume,
            &cancel,
            |_| cancel.store(true, Ordering::SeqCst),
        )
        .unwrap_err();

        assert!(matches!(error, FlashError::Cancelled));
        assert!(!volume.join("kiboar-kb60-hhkb-rev1.uf2").exists());
    }

    #[test]
    fn finds_a_bootloader_volume_by_marker() {
        let dir = tempfile::tempdir().unwrap();
        let volume = dir.path().join("RPI-RP2");
        fs::create_dir(&volume).unwrap();
        fs::write(volume.join("INFO_UF2.TXT"), "Board-ID: RP2040").unwrap();

        let found = find_bootloader_volume_in(&[(dir.path().to_path_buf(), 2)]).unwrap();
        assert_eq!(found.path, volume.display().to_string());
        assert_eq!(found.name, "RPI-RP2");
        assert!(!found.is_development);
    }

    #[test]
    fn finds_a_bootloader_volume_by_name() {
        let dir = tempfile::tempdir().unwrap();
        let volume = dir.path().join("RPI-RP2");
        fs::create_dir(&volume).unwrap();

        let found = find_bootloader_volume_in(&[(dir.path().to_path_buf(), 2)]).unwrap();
        assert_eq!(found.name, "RPI-RP2");
    }

    #[test]
    fn ignores_a_directory_that_is_not_a_bootloader() {
        let dir = tempfile::tempdir().unwrap();
        fs::create_dir(dir.path().join("NotABoard")).unwrap();

        assert!(find_bootloader_volume_in(&[(dir.path().to_path_buf(), 2)]).is_none());
    }

    #[test]
    fn finds_a_volume_one_level_down() {
        let dir = tempfile::tempdir().unwrap();
        let user = dir.path().join("user");
        let volume = user.join("RPI-RP2");
        fs::create_dir_all(&volume).unwrap();
        fs::write(volume.join("INFO_UF2.TXT"), "Board-ID: RP2040").unwrap();

        let found = find_bootloader_volume_in(&[(dir.path().to_path_buf(), 3)]).unwrap();
        assert_eq!(found.path, volume.display().to_string());
    }
}
