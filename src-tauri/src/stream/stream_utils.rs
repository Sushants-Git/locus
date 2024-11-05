use std::env;

use tauri::State;
use tokio::time::Duration;

use crate::{model::StreamState, window_info::x_window_info::stream_x11};

const XDG_SESSION_TYPE: &str = "XDG_SESSION_TYPE";

pub async fn stream_title<'r>(app: tauri::AppHandle, stream_state: State<'r, StreamState>) {
    let session_type =
        env::var(XDG_SESSION_TYPE).expect("XDG_SESSION_TYPE environment variable is not set");

    let cancel_flag = stream_state.cancel_flag.clone();
    *cancel_flag.lock().await = false;

    let sleep_duration = Duration::from_millis(300);

    match session_type.as_str() {
        "x11" => {
            let _ = stream_x11(cancel_flag, app, sleep_duration).map_err(|e| eprintln!("{}", e));
        }
        _ => {}
    }
}

pub async fn stop_stream(stream_state: State<'_, StreamState>) {
    let mut cancel_flag = stream_state.cancel_flag.lock().await;
    *cancel_flag = true;
}
