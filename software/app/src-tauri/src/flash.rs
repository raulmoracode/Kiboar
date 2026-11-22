use std::fs;
use std::path::{Path, PathBuf};

use kiboar_flash::{sha256_hex, Uf2};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

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
}

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
pub fn find_bootloader_volume() -> Option<VolumeInfo> {
    find_bootloader_volume_in(&default_search_roots())
}

/// Same as [`find_bootloader_volume`] with explicit roots, for tests.
pub fn find_bootloader_volume_in(roots: &[(PathBuf, usize)]) -> Option<VolumeInfo> {
    for (root, depth) in roots {
        if let Some(found) = scan(root, *depth) {
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

#[cfg(test)]
mod tests {
    use super::*;
    use kiboar_flash::{
        BLOCK_SIZE, FLAG_FAMILY_ID_PRESENT, MAGIC_END, MAGIC_START0, MAGIC_START1, RP2040_FAMILY_ID,
    };

    fn uf2() -> Vec<u8> {
        let mut raw = [0u8; BLOCK_SIZE];
        raw[0..4].copy_from_slice(&MAGIC_START0.to_le_bytes());
        raw[4..8].copy_from_slice(&MAGIC_START1.to_le_bytes());
        raw[8..12].copy_from_slice(&FLAG_FAMILY_ID_PRESENT.to_le_bytes());
        raw[16..20].copy_from_slice(&4u32.to_le_bytes());
        raw[24..28].copy_from_slice(&1u32.to_le_bytes());
        raw[28..32].copy_from_slice(&RP2040_FAMILY_ID.to_le_bytes());
        raw[32..36].copy_from_slice(b"test");
        raw[BLOCK_SIZE - 4..].copy_from_slice(&MAGIC_END.to_le_bytes());
        raw.to_vec()
    }

    #[test]
    fn inspects_a_valid_uf2() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("firmware.uf2");
        let bytes = uf2();
        fs::write(&path, &bytes).unwrap();

        let inspection = inspect_artifact(&path).unwrap();
        assert_eq!(inspection.size_bytes, bytes.len() as u32);
        assert_eq!(inspection.sha256, sha256_hex(&bytes));
        assert_eq!(inspection.family_id, Some(RP2040_FAMILY_ID));
        assert_eq!(inspection.blocks, 1);
        assert_eq!(inspection.payload_bytes, 4);
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
    fn finds_a_bootloader_volume_by_marker() {
        let dir = tempfile::tempdir().unwrap();
        let volume = dir.path().join("RPI-RP2");
        fs::create_dir(&volume).unwrap();
        fs::write(volume.join("INFO_UF2.TXT"), "Board-ID: RP2040").unwrap();

        let found = find_bootloader_volume_in(&[(dir.path().to_path_buf(), 2)]).unwrap();
        assert_eq!(found.path, volume.display().to_string());
        assert_eq!(found.name, "RPI-RP2");
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
