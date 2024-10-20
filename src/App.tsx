import "./App.css";

import { useWindowTitleStream } from "./hooks/useWindowTitleStream";

import Chart from "./components/Chart.tsx";
import Timer from "./components/Timer.tsx";
import DottedBackground from "./components/DottedBackground";
import Alert from "./components/Alert.tsx";
import Settings from "./components/Settings";
import useAlertStore from "./stores/alertStore.tsx";

function App() {
    const { activeWindow, isStreamRunning, changeStreamStatus } = useWindowTitleStream();

    return (
        <DottedBackground>
            <div>
                <Settings />
                <Timer />
                <Chart />
            </div>
            <AlertComponent />
        </DottedBackground>
    );

    // return (
    //   <DottedBackground>
    //     <div className="container">
    //       <h2>Current Window Title:</h2>
    //       <p>{activeWindow.title || "No title streaming"}</p>
    //       <button onClick={changeStreamStatus}>
    //         {isStreamRunning() ? "Stop Stream" : "Start Stream"}
    //       </button>
    //     </div>
    //   </DottedBackground>
    // );
}

function AlertComponent() {
    const alert = useAlertStore(state => state.alert);
    console.log(alert);
    return alert ? <Alert type={alert.type} message={alert.message} title={alert.title} /> : null;
}

export default App;
