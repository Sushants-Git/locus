// import reactLogo from "./assets/react.svg";
import "./App.css";
import DottedBackground from "./components/DottedBackground";
import { useWindowTitleStream } from "./hooks/useWindowTitleStream";

function App() {
    const { title, isStreamRunning, changeStreamStatus } = useWindowTitleStream();

    return (
        <DottedBackground>
            <div>
            Hello
            </div>
        </DottedBackground>
    );
}

export default App;

// return (
//     <DottedBackground>
//     <div className="container">
//     <h2>Current Window Title:</h2>
//     <p>{title || "No title streaming"}</p>
//     <button onClick={changeStreamStatus}>
//     {isStreamRunning() ? "Stop Stream" : "Start Stream"}
//     </button>
//     </div>
//     </DottedBackground>
// );
