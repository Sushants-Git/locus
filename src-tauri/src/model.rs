use serde::Serialize;
use std::io;
use thiserror::Error;
use x11rb::errors::{ConnectError, ConnectionError, ReplyError};

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
    #[error("Connect error: {0}")]
    ConnectError(#[from] ConnectError),
    #[error("Connection error: {0}")]
    ConnError(#[from] ConnectionError),
    #[error("Reply error: {0}")]
    ReplyError(#[from] ReplyError),
    #[error("No active window selected")]
    NoActiveWindow,
    #[error("Failed to intern atom: {0}")]
    AtomError(String),
    #[error("Invalid property format: {0}")]
    InvalidFormat(String),
    #[error("Invalid UTF-8 in window property: {0}")]
    InvalidUtf8(String),
    #[error("Malformed WM_CLASS property")]
    MalformedWMClass,
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

impl PartialEq for ActiveWindow {
    fn eq(&self, other: &Self) -> bool {
        self.class == other.class && self.title == other.title
    }
}
