import "./App.css";

import { useEffect } from "react";

import useAlertStore from "./stores/alertStore.tsx";
import { hydrateSettings, useSettingsStore } from "./stores/settingStore.tsx";

import Chart from "./components/Chart.tsx";
import Timer from "./components/Timer.tsx";
import DottedBackground from "./components/DottedBackground";
import Alert from "./components/Alert.tsx";
import Settings from "./components/Settings";
import Indicator from "./components/Indicator";

function App() {
    useEffect(() => {
        hydrateSettings();
    }, []);

    return (
        <HydrationGuard>
            <DottedBackground>
                <div>
                    <Settings />
                    <Timer />
                    <Indicator />
                    <Chart />
                </div>
                <AlertComponent />
            </DottedBackground>
        </HydrationGuard>
    );
}

function HydrationGuard({ children }: { children: React.ReactNode }) {
    const hydrated = useSettingsStore(state => state.isHydrated);

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
