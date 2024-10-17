use serde::Serialize;
use std::io;
use thiserror::Error;
use xcb::{ConnError, Error};

use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Environment variable not set: {0}")]
    EnvVarNotSet(String),
    #[error("IO error: {0}")]
    Io(#[from] io::Error),
    #[error("Regex error: {0}")]
    Regex(#[from] regex::Error),
    #[error("Parse error: {0}")]
    Parse(String),
}

#[derive(Serialize, Debug)]
pub struct Window {
    pub class: String,
    pub title: String,
    pub initial_class: String,
    pub initial_title: String,
}

pub struct StreamState {
    pub cancel_flag: Arc<Mutex<bool>>,
}

#[derive(Error, Debug)]
pub enum XError {
    #[error("Connection error: {0}")]
    ConnError(#[from] ConnError),
    #[error("Reply not received: {0}")]
    ReplyError(#[from] Error),
    #[error("Failed to fetch active window")]
    ActiveWindowError,
}

#[derive(Serialize, Debug, Clone)]
pub struct ActiveWindow {
    pub class: String,
    pub title: String,
}

impl ActiveWindow {
    pub fn none() -> Self {
        ActiveWindow {
            title: "none".to_string(),
            class: "none".to_string(),
        }
    }
}
