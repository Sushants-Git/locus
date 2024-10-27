import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Event, listen, UnlistenFn } from "@tauri-apps/api/event";

import { ActiveWindow } from "../../src/model/PomodoroTypes";
import useStreamStore from "../stores/streamStore";

export function useWindowTitleStream() {
    const [activeWindow, setActiveWindow] = useState(ActiveWindow.none());
    const streamStatus = useStreamStore(state => state.streamStatus);
    const changeStreamStatus = useStreamStore(state => state.changeStreamStatus);

    const handleWindowTitleChange = useCallback(
        (event: Event<{ title: string; class: string }>) => {
            const title = event.payload.title;
            const windowName = event.payload.class;
            setActiveWindow(prev => {
                if (prev.title === title && prev.windowName === windowName) return prev;
                return new ActiveWindow(title, windowName);
            });
        },
        []
    );

    const startListener = useCallback(async () => {
        try {
            const unlisten = await listen<{ title: string; class: string }>(
                "active-window-title",
                handleWindowTitleChange
            );
            await invoke("stream_title");
            return unlisten;
        } catch (error) {
            console.error("Failed to start stream or listen to event:", error);
            return null;
        }
    }, [handleWindowTitleChange]);

    const stopListener = useCallback(async () => {
        try {
            await invoke("stop_stream");
        } catch (error) {
            console.error("Failed to stop stream:", error);
        }
    }, []);

    useEffect(() => {
        let isActive = true;
        let unlisten: UnlistenFn | null = null;

        const manageStream = async () => {
            if (streamStatus === "streaming" && isActive) {
                unlisten = await startListener();
            } else if (streamStatus === "stopped" && isActive) {
                await stopListener();
            }
        };

        manageStream();

        return () => {
            isActive = false;
            if (unlisten) {
                unlisten();
                setActiveWindow(ActiveWindow.none());
            }
        };
    }, [streamStatus, startListener, stopListener]);

    const isStreamRunning = useCallback(
        () => !(streamStatus === "stopped" || streamStatus === "idle"),
        [streamStatus]
    );

    return { activeWindow, streamStatus, changeStreamStatus, isStreamRunning };
}
