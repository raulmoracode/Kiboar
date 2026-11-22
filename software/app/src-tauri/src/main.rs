#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod flash;
mod registry;
mod scanner;

fn main() {
    tauri::Builder::default()
        .manage(flash::FlashState::default())
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
