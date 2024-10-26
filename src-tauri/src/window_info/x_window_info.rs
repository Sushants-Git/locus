use std::sync::Arc;
use tauri::{Emitter, EventTarget};
use tokio::{
    sync::Mutex,
    time::{sleep, Duration},
};
use x11rb::{
    connection::Connection,
    protocol::xproto::{Atom, AtomEnum, ConnectionExt, GetPropertyReply, Window},
    rust_connection::RustConnection,
};

use crate::model::{ActiveWindow, XError};

pub fn stream_x11(
    cancel_flag: Arc<Mutex<bool>>,
    app: tauri::AppHandle,
    sleep_duration: Duration,
) -> Result<(), XError> {
    let (conn, screen) = x11rb::connect(None).map_err(|e| XError::ConnectError(e))?;
    let root = conn.setup().roots[screen].root;
    let net_active_window = get_or_intern_atom(&conn, b"_NET_ACTIVE_WINDOW")?;
    let net_wm_name = get_or_intern_atom(&conn, b"_NET_WM_NAME")?;
    let utf8_string = get_or_intern_atom(&conn, b"UTF8_STRING")?;

    tokio::spawn(async move {
        loop {
            if *cancel_flag.lock().await {
                break;
            }

            let window_info =
                get_x_active_window_info(&conn, root, net_active_window, net_wm_name, utf8_string)
                    .unwrap_or_else(|error| {
                        eprintln!("Error getting window info: {:?}", error);
                        ActiveWindow::none()
                    });

            // Stream
            if let Err(e) = app.emit_to(EventTarget::app(), "active-window-title", window_info) {
                eprintln!("Error emitting window info: {:?}", e);
            }
            sleep(sleep_duration).await;
        }
    });

    Ok(())
}

fn get_x_active_window_info(
    conn: &RustConnection,
    root: u32,
    net_active_window: u32,
    net_wm_name: u32,
    utf8_string: u32,
) -> Result<ActiveWindow, XError> {
    let focus = find_active_window(&conn, root, net_active_window)?;

    let (net_wm_name, utf8_string) = (net_wm_name, utf8_string);
    let (wm_class, string): (Atom, Atom) = (AtomEnum::WM_CLASS.into(), AtomEnum::STRING.into());

    let name = conn
        .get_property(false, focus, net_wm_name, utf8_string, 0, u32::MAX)
        .map_err(XError::ConnError)?
        .reply()
        .map_err(XError::ReplyError)?;

    let class = conn
        .get_property(false, focus, wm_class, string, 0, u32::MAX)
        .map_err(XError::ConnError)?
        .reply()
        .map_err(XError::ReplyError)?;

    Ok(ActiveWindow {
        class: parse_wm_class(&class)?,
        title: parse_string_property(name)?,
    })
}

fn get_or_intern_atom(conn: &RustConnection, name: &[u8]) -> Result<Atom, XError> {
    conn.intern_atom(false, name)
        .map_err(|e| XError::ConnError(e))?
        .reply()
        .map_err(|e| XError::AtomError(format!("Failed to intern atom: {}", e)))
        .map(|reply| reply.atom)
}

fn find_active_window(
    conn: &impl Connection,
    root: Window,
    net_active_window: Atom,
) -> Result<Window, XError> {
    let window: Atom = AtomEnum::WINDOW.into();
    let active_window = conn
        .get_property(false, root, net_active_window, window, 0, 1)
        .map_err(XError::ConnError)?
        .reply()
        .map_err(XError::ReplyError)?;

    if active_window.format == 32 && active_window.length == 1 {
        active_window
            .value32()
            .ok_or_else(|| XError::InvalidFormat("Expected 32-bit format".into()))?
            .next()
            .ok_or(XError::NoActiveWindow)
    } else {
        conn.get_input_focus()
            .map_err(XError::ConnError)?
            .reply()
            .map_err(XError::ReplyError)
            .map(|reply| reply.focus)
    }
}

fn parse_string_property(property: GetPropertyReply) -> Result<String, XError> {
    String::from_utf8(property.value).map_err(|e| XError::InvalidUtf8(e.to_string()))
}

fn parse_wm_class(property: &GetPropertyReply) -> Result<String, XError> {
    if property.format != 8 {
        return Err(XError::InvalidFormat(
            "WM_CLASS property must be 8-bit format".into(),
        ));
    }

    let value = &property.value;

    let middle = value
        .iter()
        .position(|&b| b == 0)
        .ok_or(XError::MalformedWMClass)?;

    let (_, class) = value.split_at(middle);

    let mut class = &class[1..];

    if class.last() == Some(&0) {
        class = &class[..class.len() - 1];
    }

    String::from_utf8(class.to_vec()).map_err(|e| XError::InvalidUtf8(e.to_string()))
}
