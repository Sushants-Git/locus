import { useWindowTitleStream } from "../hooks/useWindowTitleStream";

export default function Indicator() {
    const { activeWindow, isStreamRunning, changeStreamStatus } = useWindowTitleStream();

    console.log(activeWindow);

    return null;

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
