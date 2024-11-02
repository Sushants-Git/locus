import "./App.css";

import { memo, useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import useAlertStore from "./stores/alertStore.tsx";
import {
    hydrateSettings,
    useChartStore,
    useSettingsStore,
    useTimerStore,
} from "./stores/settingStore.tsx";

import Chart from "./components/Chart";
import Timer from "./components/Timer.tsx";
import DottedBackground from "./components/DottedBackground";
import Alert from "./components/Alert.tsx";
import Settings from "./components/Settings";
import Indicator from "./components/Indicator";
import ModeToggle from "@/components/ui/mode-toggle.tsx";
import { ThemeProvider } from "@/components/ui/theme-provider.tsx";

import { SessionHistory, TitleRanges } from "./model/SessionHistory.ts";
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
    const addToChartHistory = useChartStore(state => state.addToChartHistory);

    const [chart, setChart] = useState(() => {
        const totalPomodoro =
            sessionLengthInSeconds * numberOfSessions + breakLengthInSeconds * numberOfSessions;

        return new SessionHistory(totalPomodoro, new Date());
    });

    const adjustChart = useCallback((totalPomodoro: number) => {
        setChart(prev => {
            const updateChart = new SessionHistory(totalPomodoro, prev.sessionStartedOn, prev.id);

            updateChart.chartData = prev.chartData;

            return updateChart;
        });
    }, []);

    const updateChart = useCallback((activeWindowName: string, titleRanges: TitleRanges[]) => {
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
    }, []);

    const resetChart = useCallback(() => {
        addToChartHistory(chart);

        setChart(() => {
            const totalPomodoro =
                sessionLengthInSeconds * numberOfSessions + breakLengthInSeconds * numberOfSessions;

            const chart = new SessionHistory(totalPomodoro, new Date());

            return chart;
        });
    }, [chart, sessionLengthInSeconds, numberOfSessions, breakLengthInSeconds]);

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <HydrationGuard>
                <DottedBackground>
                    <div className="h-screen flex flex-col justify-center">
                        <Settings />
                        <div className="h-3/4 flex flex-col gap-16 justify-center">
                            <Timer
                                updateChart={updateChart}
                                adjustChart={adjustChart}
                                resetChart={resetChart}
                            />
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
