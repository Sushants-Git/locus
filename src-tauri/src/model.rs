use serde::Serialize;
use std::io;
use thiserror::Error;

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
