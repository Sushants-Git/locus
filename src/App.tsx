import "./App.css";

import { useWindowTitleStream } from "./hooks/useWindowTitleStream";

import Chart from "./components/Chart.tsx";
import Timer from "./components/Timer.tsx";
import DottedBackground from "./components/DottedBackground";
import Alert from "./components/Alert.tsx";
import Settings from "./components/Settings";
import useAlertStore from "./stores/alertStore.tsx";
import { hydrateSettings, useSettingStore } from "./stores/settingStore.tsx";
import { useEffect } from "react";

function App() {
    const { activeWindow, isStreamRunning, changeStreamStatus } = useWindowTitleStream();

    useEffect(() => {
        hydrateSettings();
    }, []);

    return (
        <HydrationGuard>
            <DottedBackground>
                <div>
                    <Settings />
                    <Timer />
                    <Chart />
                </div>
                <AlertComponent />
            </DottedBackground>
        </HydrationGuard>
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

function HydrationGuard({ children }: { children: React.ReactNode }) {
    const hydrated = useSettingStore(state => state._settingHydrate);

    if (!hydrated) {
        return null;
    }

    return <>{children}</>;
}

function AlertComponent() {
    const alert = useAlertStore(state => state.alert);
    return alert ? <Alert type={alert.type} message={alert.message} title={alert.title} /> : null;
}

export default App;
