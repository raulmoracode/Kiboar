#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod scanner;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::list_devices,
            commands::read_board_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running Kiboar Studio");
}
