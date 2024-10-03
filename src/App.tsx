import { useEffect, useState } from "react";
// import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import "./App.css";

function App() {
    const [title, setTitle] = useState("");
    const [streamStatus, setStreamStatus] = useState<
        "not-started" | "streaming" | "stopped"
    >("not-started");

    useEffect(() => {
        let unlisten: UnlistenFn | null = null;

        const setupListener = async () => {
            await invoke("stream_title");
            unlisten = await listen<string>("window-title-updated", (event) => {
                setTitle(event.payload);
            });
        };

        const stopListener = async () => {
            await invoke("stop_stream");
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

    const toggleStream = () => {
        setStreamStatus((prevStatus) => {
            switch (prevStatus) {
                case "not-started":
                case "stopped":
                    return "streaming";
                case "streaming":
                    return "stopped";
            }
        });
    };

    return (
        <div className="container">
            <h2>Current Window Title:</h2>
            <p>{title || "No title streaming"}</p>
            <button onClick={toggleStream}>
                {streamStatus === "stopped" ? "Start Stream" : "Stop Stream"}
            </button>
        </div>
    );
}

export default App;
