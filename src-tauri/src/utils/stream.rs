use tauri::{Emitter, EventTarget, State};
use tokio::time::{sleep, Duration};

use crate::{model::StreamState, window_info::hyprland_window_info};

async fn get_hypr_title() -> String {
    let hyprland_title = hyprland_window_info::get_title().await;
    hyprland_title.unwrap_or_else(|error| {
        dbg!(error);
        "none".to_string()
    })
}

pub async fn stream_title<'r>(app: tauri::AppHandle, stream_state: State<'r, StreamState>) {
    let cancel_flag = stream_state.cancel_flag.clone();
    *cancel_flag.lock().await = false;

    tokio::spawn(async move {
        loop {
            if *cancel_flag.lock().await {
                break;
            }

            let title = get_hypr_title().await;
            app.emit_to(EventTarget::app(), "window-title-updated", title)
                .unwrap();
            sleep(Duration::from_millis(200)).await; // Add a 200-milli-second delay
        }
    });
}

pub async fn stop_stream(stream_state: State<'_, StreamState>) {
    let mut cancel_flag = stream_state.cancel_flag.lock().await;
    *cancel_flag = true;
}
