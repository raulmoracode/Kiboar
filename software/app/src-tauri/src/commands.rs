use std::path::PathBuf;

use kiboar_device::{BoardInfo, Device};
use tauri::Manager;

use crate::flash::{self, ArtifactInspection, VolumeInfo};
use crate::registry::{self, BoardSummary};
use crate::scanner::scan_devices;

#[tauri::command]
pub async fn list_devices() -> Result<Vec<Device>, String> {
    tauri::async_runtime::spawn_blocking(scan_devices)
        .await
        .map_err(|error| format!("device scan task failed: {error}"))?
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn read_board_info(id: String) -> Result<BoardInfo, String> {
    let devices = tauri::async_runtime::spawn_blocking(scan_devices)
        .await
        .map_err(|error| format!("device scan task failed: {error}"))?
        .map_err(|error| error.to_string())?;

    devices
        .into_iter()
        .find_map(|device| match device {
            Device::Kiboar {
                id: device_id,
                info,
                ..
            } if device_id == id => Some(info),
            _ => None,
        })
        .ok_or_else(|| format!("no Kiboar board with id {id}"))
}

#[tauri::command]
pub async fn list_boards(app: tauri::AppHandle) -> Result<Vec<BoardSummary>, String> {
    let resource_dir = app.path().resource_dir().ok();
    tauri::async_runtime::spawn_blocking(move || {
        let root = registry::data_root(resource_dir)?;
        registry::list_boards_in(&root)
    })
    .await
    .map_err(|error| format!("board registry task failed: {error}"))?
}

#[tauri::command]
pub async fn inspect_artifact(path: String) -> Result<ArtifactInspection, String> {
    let path = PathBuf::from(path);
    tauri::async_runtime::spawn_blocking(move || flash::inspect_artifact(&path))
        .await
        .map_err(|error| format!("artefact inspection task failed: {error}"))?
}

#[tauri::command]
pub async fn detect_bootloader_volume() -> Result<Option<VolumeInfo>, String> {
    let volume = tauri::async_runtime::spawn_blocking(flash::find_bootloader_volume)
        .await
        .map_err(|error| format!("bootloader volume task failed: {error}"))?;
    Ok(volume)
}
