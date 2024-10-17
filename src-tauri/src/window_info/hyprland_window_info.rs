use nix::unistd::Uid;
use regex::Regex;
use std::{env, path::Path};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::UnixStream;

use crate::model::{ActiveWindow, AppError, Window};

const HYPRLAND_INSTANCE_SIGNATURE: &str = "HYPRLAND_INSTANCE_SIGNATURE";
const XDG_RUNTIME_DIR: &str = "XDG_RUNTIME_DIR";
const HYPR_DIR: &str = "hypr";
const DEFAULT_RUNTIME_DIR: &str = "/run/user";

pub async fn get_hypr_active_window_info() -> Result<ActiveWindow, AppError> {
    let input = get_hyprctl_active_window().await?;
    let window = string_to_window(&input)?;
    Ok(ActiveWindow {
        title: window.title,
        class: window.class,
    })
}

fn string_to_window(input: &str) -> Result<Window, AppError> {
    let re = Regex::new(
        r"class: (.+)\n\s*title: (.+)\n\s*initialClass: (.+)\n\s*initialTitle: (.+)\n\s",
    )?;
    let re_replace = Regex::new(r"\\x")?;
    let output = re_replace.replace_all(input, "\\u00").to_string();

    re.captures(&output)
        .map(|captures| Window {
            class: captures[1].to_string(),
            title: captures[2].to_string(),
            initial_class: captures[3].to_string(),
            initial_title: captures[4].to_string(),
        })
        .ok_or_else(|| AppError::Parse("Could not parse input.".to_string()))
}

fn get_hyprctl_runtime_dir() -> Result<String, AppError> {
    env::var(XDG_RUNTIME_DIR)
        .map(|path| format!("{}/{}", path, HYPR_DIR))
        .or_else(|_| {
            let uid = get_current_uid();
            Ok(format!("{}/{}/{}", DEFAULT_RUNTIME_DIR, uid, HYPR_DIR))
        })
}

fn get_hyprctl_instance_signature() -> Result<String, AppError> {
    env::var(HYPRLAND_INSTANCE_SIGNATURE).map_err(|_| {
        AppError::EnvVarNotSet(
            "HYPRLAND_INSTANCE_SIGNATURE not set! (is hyprland running?)".to_string(),
        )
    })
}

fn get_current_uid() -> String {
    Uid::current().to_string()
}

async fn get_hyprctl_active_window() -> Result<String, AppError> {
    let runtime_dir = get_hyprctl_runtime_dir()?;
    let hyprctl_instance = get_hyprctl_instance_signature()?;
    let socket_path = format!("{}/{}/.socket.sock", runtime_dir, hyprctl_instance);
    let path = Path::new(&socket_path);

    let mut socket = UnixStream::connect(&path).await?;

    socket.write_all(b"/activewindow").await?;

    let mut buffer = Vec::new();
    let mut temp_buffer = vec![0u8; 1024];

    loop {
        let length = socket.read(&mut temp_buffer).await?;
        if length == 0 {
            break;
        }
        buffer.extend(&temp_buffer[..length]);
    }

    socket.shutdown().await?;

    String::from_utf8(buffer).map_err(|e| AppError::Parse(e.to_string()))
}
