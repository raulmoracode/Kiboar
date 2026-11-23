#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

mod commands;
mod flash;
mod registry;
mod scanner;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(flash::FlashState::default())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_devices,
            commands::read_board_info,
            commands::list_boards,
            commands::inspect_artifact,
            commands::detect_bootloader_volume,
            commands::flash_firmware,
            commands::cancel_flash
        ])
        .run(tauri::generate_context!())
        .expect("error while running Kiboar Studio");
}
