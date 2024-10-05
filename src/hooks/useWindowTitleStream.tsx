import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import useStreamStore from "../stores/streamStore";

export function useWindowTitleStream() {
    const [title, setTitle] = useState("");
    const { streamStatus, changeStreamStatus } = useStreamStore();

    useEffect(() => {
        let unlisten: UnlistenFn | null = null;

        const setupListener = async () => {
            try {
                await invoke("stream_title");
                unlisten = await listen<string>("window-title-updated", (event) => {
                    setTitle(event.payload);
                });
            } catch (error) {
                console.error("Failed to start stream or listen to event:", error);
            }
        };

        const stopListener = async () => {
            try {
                await invoke("stop_stream");
            } catch (error) {
                console.error("Failed to stop stream:", error);
            }
        };

        if (streamStatus === "streaming") {
            setupListener();
        } else if (streamStatus === "stopped") {
            stopListener();
        }

        return () => {
            if (unlisten) {
                unlisten();
            }
        };
    }, [streamStatus]);

    const isStreamRunning = () =>
        !(streamStatus === "stopped" || streamStatus === "not-started");

    return { title, streamStatus, changeStreamStatus, isStreamRunning };
}
