import { Button } from "@/components/ui/button";
import Firefox from "./firefox.svg?react";

import { useWindowTitleStream } from "../hooks/useWindowTitleStream";

export default function Indicator() {
    const { activeWindow, isStreamRunning, changeStreamStatus } = useWindowTitleStream();

    return (
        <Button className="rounded-full flex items-center gap-2" onClick={changeStreamStatus}>
            <div>
                <Firefox className="text-white h-6 w-6 rounded-full" />
            </div>
            <span>{activeWindow.title}</span>
        </Button>
    );

    return (
        <div>
            <h2>Current Window Title:</h2>
            <p>{activeWindow.title}</p>
            <button onClick={changeStreamStatus}>
                {isStreamRunning() ? "Stop Stream" : "Start Stream"}
            </button>
        </div>
    );
}
