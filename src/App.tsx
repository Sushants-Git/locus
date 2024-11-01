import "./App.css";

import { memo, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import useAlertStore from "./stores/alertStore.tsx";
import { hydrateSettings, useSettingsStore, useTimerStore } from "./stores/settingStore.tsx";

import Chart, { TitleRanges } from "./components/Chart";
import Timer from "./components/Timer.tsx";
import DottedBackground from "./components/DottedBackground";
import Alert from "./components/Alert.tsx";
import Settings from "./components/Settings";
import Indicator from "./components/Indicator";
import ModeToggle from "@/components/ui/mode-toggle.tsx";
import { ThemeProvider } from "@/components/ui/theme-provider.tsx";

import { SessionHistory } from "./model/SessionHistory.ts";
import { ActiveWindow } from "./model/PomodoroTypes.ts";

function App() {
    useEffect(() => {
        hydrateSettings();
    }, []);

    const { sessionLengthInSeconds, numberOfSessions, breakLengthInSeconds } = useTimerStore(
        useShallow(state => ({
            sessionLengthInSeconds: state.sessionLengthInSeconds,
            numberOfSessions: state.numberOfSessions,
            breakLengthInSeconds: state.breakLengthInSeconds,
        }))
    );
    const [chart, setChart] = useState(() => {
        const totalPomodoro =
            sessionLengthInSeconds * numberOfSessions + breakLengthInSeconds * numberOfSessions;

        return new SessionHistory(totalPomodoro, new Date());
    });

    const updateChart = (activeWindowName: string, titleRanges: TitleRanges[]) => {
        setChart(prev => {
            const updateChart = new SessionHistory(
                prev.pomodoroLengthInSeconds,
                prev.sessionStartedOn,
                prev.id
            );

            updateChart.chartData = new Map(prev.chartData);

            titleRanges.forEach(({ title, range }) => {
                updateChart.insertData(new ActiveWindow(title, activeWindowName), range);
            });

            return updateChart;
        });
    };

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <HydrationGuard>
                <DottedBackground>
                    <div className="h-screen flex flex-col justify-center">
                        <Settings />
                        <div className="h-3/4 flex flex-col gap-16 justify-center">
                            <Timer updateChart={updateChart} />
                            <Indicator />
                            <Chart chart={chart} />
                        </div>
                        <ModeToggle />
                        <AlertComponent />
                    </div>
                </DottedBackground>
            </HydrationGuard>
        </ThemeProvider>
    );
}

function HydrationGuard({ children }: { children: React.ReactNode }) {
    const hydrated = useSettingsStore(state => state.isHydrated);

    if (!hydrated) {
        return null;
    }

    return <>{children}</>;
}

const AlertComponent = memo(function AlertComponent() {
    const alert = useAlertStore(state => state.alert);
    return alert ? <Alert type={alert.type} message={alert.message} title={alert.title} /> : null;
});

export default App;
