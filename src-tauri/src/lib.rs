mod model;
mod stream;
mod window_info;

use std::{env, fs, path::Path, sync::Arc};
use tauri::{generate_handler, State};
use tokio::sync::Mutex;
use uuid::Uuid;

use model::StreamState;
use stream::stream_utils;

#[tauri::command]
async fn stream_title<'r>(
    app: tauri::AppHandle,
    stream_state: State<'r, StreamState>,
) -> Result<(), ()> {
    stream_utils::stream_title(app, stream_state).await;

    Ok(())
}

#[tauri::command]
async fn stop_stream(stream_state: State<'_, StreamState>) -> Result<(), ()> {
    stream_utils::stop_stream(stream_state).await;

    Ok(())
}

#[tauri::command]
fn save_file(from: String, to: String, target_folder: String) -> Result<String, String> {
    let source_path = Path::new(&from);

    let file_extension = source_path
        .extension()
        .and_then(|ext| ext.to_str())
        .ok_or("Unable to extract file extension")?;

    let unique_file_name = format!("{}.{}", Uuid::new_v4(), file_extension);
    let destination_path = Path::new(&to).join(&target_folder);

    if !destination_path.exists() {
        fs::create_dir_all(&destination_path)
            .map_err(|e| format!("Unable to create the destination folder: {:?}", e))?;
    }

    let destination_file_path = destination_path.join(unique_file_name);

    fs::copy(&source_path, &destination_file_path)
        .map_err(|e| format!("Unable to copy file to destination: {:?}", e))?;

    destination_file_path
        .to_str()
        .ok_or("Failed to convert path to a valid UTF-8 string".to_string())
        .map(|s| s.to_string())
}

#[tauri::command]
fn supported_display_server() -> bool {
    match std::env::var("XDG_SESSION_TYPE") {
        Ok(ref session_type) if session_type == "x11" => true,
        Ok(_) => false,
        Err(_) => {
            eprintln!("XDG_SESSION_TYPE environment variable is not set");
            false
        }
    }
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
        .invoke_handler(generate_handler![
            stream_title,
            stop_stream,
            save_file,
            supported_display_server
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
