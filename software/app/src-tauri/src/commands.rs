use std::path::PathBuf;
use std::sync::atomic::Ordering;
use std::sync::Arc;

use kiboar_device::{BoardInfo, Device};
use tauri::{Emitter, Manager, State};

use crate::flash::{
    self, ArtifactInspection, FlashOutcome, FlashProgress, FlashRequest, VolumeInfo,
};
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

#[tauri::command]
pub async fn flash_firmware(
    app: tauri::AppHandle,
    state: State<'_, flash::FlashState>,
    request: FlashRequest,
) -> Result<FlashOutcome, String> {
    let cancel = Arc::clone(&state.0);
    cancel.store(false, Ordering::SeqCst);

    let volume = flash::find_bootloader_volume()
        .ok_or_else(|| "no RP2040 bootloader volume is mounted".to_string())?;
    let volume_path = PathBuf::from(&volume.path);
    let resource_dir = app.path().resource_dir().ok();
    let app_for_events = app.clone();

    tauri::async_runtime::spawn_blocking(move || {
        let root = registry::data_root(resource_dir)?;
        flash::flash_to_volume(&request, &root, &volume_path, &cancel, |progress| {
            let _ = app_for_events.emit(
                "flash-progress",
                FlashProgress {
                    bytes_written: u32::try_from(progress.bytes_written).unwrap_or(u32::MAX),
                    total_bytes: u32::try_from(progress.total_bytes).unwrap_or(u32::MAX),
                },
            );
        })
        .map_err(|error| error.to_string())
    })
    .await
    .map_err(|error| format!("flash task failed: {error}"))?
}

#[tauri::command]
pub fn cancel_flash(state: State<'_, flash::FlashState>) {
    state.0.store(true, Ordering::SeqCst);
}
