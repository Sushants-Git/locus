mod model;
mod utils;
mod window_info;

use std::{fs, path::Path, sync::Arc};
use tauri::{generate_handler, State};
use tokio::sync::Mutex;

use model::StreamState;
use utils::stream;

#[tauri::command]
async fn stream_title<'r>(
    app: tauri::AppHandle,
    stream_state: State<'r, StreamState>,
) -> Result<(), ()> {
    stream::stream_title(app, stream_state).await;

    Ok(())
}

#[tauri::command]
async fn stop_stream(stream_state: State<'_, StreamState>) -> Result<(), ()> {
    stream::stop_stream(stream_state).await;

    Ok(())
}

#[tauri::command]
fn save_file(from: String, to: String, target_folder: String) -> Result<String, String> {
    let source_path = Path::new(&from);

    let file_name = source_path
        .file_name()
        .ok_or("Unable to extract the file name")?;

    let destination_path = Path::new(&to).join(&target_folder);

    if !destination_path.exists() {
        fs::create_dir_all(&destination_path)
            .map_err(|e| format!("Unable to create the destination folder: {:?}", e))?;
    }

    let destination_file_path = destination_path.join(file_name);

    fs::copy(&source_path, &destination_file_path)
        .map_err(|e| format!("Unable to copy file to destination: {:?}", e))?;

    destination_file_path
        .to_str()
        .ok_or("Failed to convert path to a valid UTF-8 string".to_string())
        .map(|s| s.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let stream_state = StreamState {
        cancel_flag: Arc::new(Mutex::new(false)),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(stream_state)
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(generate_handler![stream_title, stop_stream, save_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
