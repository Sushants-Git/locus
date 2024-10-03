mod model;
mod utils;
mod window_info;

use model::StreamState;
use std::sync::Arc;
use tauri::{generate_handler, State};
use tokio::sync::Mutex;
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let stream_state = StreamState {
        cancel_flag: Arc::new(Mutex::new(false)),
    };

    tauri::Builder::default()
        .manage(stream_state)
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(generate_handler![stream_title, stop_stream])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
