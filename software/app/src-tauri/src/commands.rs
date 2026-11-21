use kiboar_device::{BoardInfo, Device};

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
