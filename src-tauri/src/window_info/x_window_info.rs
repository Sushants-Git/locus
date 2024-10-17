use xcb::x::Window;
use xcb_wm::{ewmh, icccm};

use crate::model::{ActiveWindow, XError};

pub fn get_x_active_window_info() -> Result<ActiveWindow, XError> {
    let (xcb_conn, _) = xcb::Connection::connect(None)?;
    let ewmh_conn = ewmh::Connection::connect(&xcb_conn);
    let icccm_conn = icccm::Connection::connect(&xcb_conn);

    let active_window = get_active_window(&ewmh_conn)?;
    let window_name = get_window_name(&icccm_conn, active_window)?;
    let window_class = get_window_class(&icccm_conn, active_window)?;

    Ok(ActiveWindow {
        class: window_class,
        title: window_name,
    })
}

fn get_active_window(ewmh_conn: &ewmh::Connection) -> Result<Window, XError> {
    let request = ewmh::GetActiveWindow;
    let cookie = ewmh_conn.send_request(&request);
    let reply = ewmh_conn
        .wait_for_reply(cookie)
        .map_err(|_| XError::ActiveWindowError)?;
    Ok(reply.window)
}

fn get_window_name(icccm_conn: &icccm::Connection, window: Window) -> Result<String, XError> {
    let request = icccm::GetWmName::new(window);
    let cookie = icccm_conn.send_request(&request);
    let reply = icccm_conn.wait_for_reply(cookie)?;
    Ok(reply.name)
}

fn get_window_class(icccm_conn: &icccm::Connection, window: Window) -> Result<String, XError> {
    let request = icccm::GetWmClass::new(window);
    let cookie = icccm_conn.send_request(&request);
    let reply = icccm_conn.wait_for_reply(cookie)?;
    Ok(reply.class)
}
