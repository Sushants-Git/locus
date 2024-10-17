import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Event, listen, UnlistenFn } from "@tauri-apps/api/event";

import { ActiveWindow } from "../../src/model/PomodoroTypes";
import useStreamStore from "../stores/streamStore";

export function useWindowTitleStream() {
    const [activeWindow, setActiveWindow] = useState(ActiveWindow.none());
    const { streamStatus, changeStreamStatus } = useStreamStore();

    const handleWindowTitleChange = useCallback((event: Event<ActiveWindow>) => {
        setActiveWindow(event.payload);
    }, []);

    const startListener = useCallback(async () => {
        try {
            await invoke("stream_title");
            const unlisten = await listen<ActiveWindow>(
                "active-window-title",
                handleWindowTitleChange
            );
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
        let unlisten: UnlistenFn | null = null;

        const manageStream = async () => {
            if (streamStatus === "streaming") {
                unlisten = await startListener();
            } else if (streamStatus === "stopped") {
                await stopListener();
            }
        };

        manageStream();

        return () => {
            if (unlisten) {
                unlisten();
            }
        };
    }, [streamStatus, startListener, stopListener]);

    const isStreamRunning = () => !(streamStatus === "stopped" || streamStatus === "not-started");

    return { activeWindow, streamStatus, changeStreamStatus, isStreamRunning };
}
