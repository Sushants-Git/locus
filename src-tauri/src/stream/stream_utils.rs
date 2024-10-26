use std::env;

use tauri::{Emitter, EventTarget, State};
use tokio::time::{sleep, Duration};

use crate::{
    model::{ActiveWindow, StreamState},
    window_info::{hyprland_window_info, x_window_info::stream_x11},
};

const XDG_SESSION_TYPE: &str = "XDG_SESSION_TYPE";

async fn get_hypr_title() -> ActiveWindow {
    let hyprland_title = hyprland_window_info::get_hypr_active_window_info().await;
    hyprland_title.unwrap_or_else(|error| {
        dbg!(error);
        ActiveWindow::none()
    })
}

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
        "wayland" => {
            // TODO: currently this will only works for hyprland
            // need to make it so that it works for all wayland display managers

            tokio::spawn(async move {
                loop {
                    if *cancel_flag.lock().await {
                        break;
                    }

                    let window_info = get_hypr_title().await;
                    app.emit_to(EventTarget::app(), "active-window-title", window_info)
                        .unwrap();

                    sleep(Duration::from_millis(200)).await;
                }
            });
        }
        _ => {}
    }
}

pub async fn stop_stream(stream_state: State<'_, StreamState>) {
    let mut cancel_flag = stream_state.cancel_flag.lock().await;
    *cancel_flag = true;
}
