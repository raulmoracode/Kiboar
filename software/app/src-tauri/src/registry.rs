use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// The subset of a board definition the selector needs.
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/lib/bindings/")]
pub struct BoardSummary {
    pub board_id: String,
    pub name: String,
    pub hw_rev: u32,
    pub mcu: String,
    pub rows: u32,
    pub cols: u32,
    pub keys: u32,
    pub layers: u32,
    pub split: bool,
    pub layout: Vec<KeyPosition>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/lib/bindings/")]
pub struct KeyPosition {
    pub x: f32,
    pub y: f32,
    pub w: f32,
    pub h: f32,
}

#[derive(Deserialize)]
struct RawRegistry {
    boards: Vec<RawBoardEntry>,
}

#[derive(Deserialize)]
struct RawBoardEntry {
    board_id: String,
    hw_rev: u32,
    definition: String,
}

#[derive(Deserialize)]
struct RawDefinition {
    board_id: String,
    name: String,
    hw_rev: u32,
    mcu: String,
    matrix: RawMatrix,
    keys: Vec<RawKey>,
    layers: Vec<serde_json::Value>,
    split: bool,
}

#[derive(Deserialize)]
struct RawMatrix {
    rows: u32,
    cols: u32,
}

#[derive(Deserialize)]
struct RawKey {
    x: f32,
    y: f32,
    #[serde(default = "default_key_size")]
    w: f32,
    #[serde(default = "default_key_size")]
    h: f32,
}

fn default_key_size() -> f32 {
    1.0
}

/// Directory that holds `registry/index.json` and `boards/`.
///
/// In development it is the `software/` directory; when the application is
/// bundled it is the resource directory.
pub fn data_root(resource_dir: Option<PathBuf>) -> Result<PathBuf, String> {
    if let Some(dir) = resource_dir {
        if dir.join("registry/index.json").is_file() {
            return Ok(dir);
        }
    }

    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let software = manifest
        .parent()
        .and_then(Path::parent)
        .ok_or_else(|| "cannot locate the software directory".to_string())?;
    if software.join("registry/index.json").is_file() {
        return Ok(software.to_path_buf());
    }

    Err("the board registry is not available; expected registry/index.json".to_string())
}

/// Read the registry and every board definition it points at.
pub fn list_boards_in(root: &Path) -> Result<Vec<BoardSummary>, String> {
    let registry_path = root.join("registry/index.json");
    let registry: RawRegistry = serde_json::from_slice(
        &fs::read(&registry_path)
            .map_err(|error| format!("cannot read {}: {error}", registry_path.display()))?,
    )
    .map_err(|error| format!("cannot parse {}: {error}", registry_path.display()))?;

    let mut boards = Vec::with_capacity(registry.boards.len());
    for entry in registry.boards {
        let definition_path = root.join(&entry.definition);
        let definition: RawDefinition = serde_json::from_slice(
            &fs::read(&definition_path)
                .map_err(|error| format!("cannot read {}: {error}", definition_path.display()))?,
        )
        .map_err(|error| format!("cannot parse {}: {error}", definition_path.display()))?;

        if definition.board_id != entry.board_id || definition.hw_rev != entry.hw_rev {
            return Err(format!(
                "{} declares {} rev {}, but the registry says {} rev {}",
                entry.definition,
                definition.board_id,
                definition.hw_rev,
                entry.board_id,
                entry.hw_rev
            ));
        }

        boards.push(BoardSummary {
            board_id: definition.board_id,
            name: definition.name,
            hw_rev: definition.hw_rev,
            mcu: definition.mcu,
            rows: definition.matrix.rows,
            cols: definition.matrix.cols,
            keys: definition.keys.len() as u32,
            layers: definition.layers.len() as u32,
            split: definition.split,
            layout: definition
                .keys
                .into_iter()
                .map(|key| KeyPosition {
                    x: key.x,
                    y: key.y,
                    w: key.w,
                    h: key.h,
                })
                .collect(),
        });
    }

    boards.sort_by(|a, b| a.board_id.cmp(&b.board_id));
    Ok(boards)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn repo_root() -> PathBuf {
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .and_then(Path::parent)
            .unwrap()
            .to_path_buf()
    }

    #[test]
    fn reads_the_registry_boards() {
        let boards = list_boards_in(&repo_root()).unwrap();
        assert_eq!(boards.len(), 3);

        let kb60 = boards
            .iter()
            .find(|board| board.board_id == "kb60-hhkb")
            .unwrap();
        assert_eq!(kb60.hw_rev, 1);
        assert_eq!(kb60.mcu, "rp2040-zero");
        assert_eq!(kb60.rows, 5);
        assert_eq!(kb60.cols, 14);
        assert_eq!(kb60.keys, 61);
        assert_eq!(kb60.layers, 1);
        assert!(!kb60.split);
        assert_eq!(kb60.layout.len(), 61);
    }

    #[test]
    fn rejects_a_definition_that_disagrees_with_the_registry() {
        let dir = tempfile::tempdir().unwrap();
        fs::create_dir_all(dir.path().join("registry")).unwrap();
        fs::create_dir_all(dir.path().join("boards/x")).unwrap();
        fs::write(
            dir.path().join("registry/index.json"),
            r#"{"boards":[{"board_id":"x","hw_rev":1,"definition":"boards/x/rev1.json"}]}"#,
        )
        .unwrap();
        fs::write(
            dir.path().join("boards/x/rev1.json"),
            r#"{"board_id":"y","name":"Y","hw_rev":1,"mcu":"rp2040-zero","matrix":{"rows":1,"cols":1},"keys":[],"layers":[{}],"split":false}"#,
        )
        .unwrap();

        let error = list_boards_in(dir.path()).unwrap_err();
        assert!(error.contains("but the registry says"), "{error}");
    }
}
