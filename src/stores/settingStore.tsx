import { create } from "zustand";
import { z } from "zod";
import { defaults } from "../constants";
import { SessionHistory } from "../model/SessionHistory";
import { loadChartStore, loadStore } from "./store";

const timerSettingsSchema = z.object({
    sessionLengthInSeconds: z
        .number()
        .min(1)
        .default(25 * 60),
    numberOfSessions: z.number().min(1).default(2),
    breakLengthInSeconds: z
        .number()
        .min(0)
        .default(5 * 60),
});

const appearanceSettingsSchema = z.object({
    backgroundImagePath: z.string().nullable(),
    accentColor: z.string().nullable(),
});

const chartSettingsSchema = z.object({
    minimumActivityDuration: z.number().min(1).default(defaults.minimumActivityDuration),
});

const chartHistorySchema = z.object({
    chartData: z.record(
        z.array(z.object({ range: z.tuple([z.number(), z.number()]), title: z.string() }))
    ),
    id: z.string(),
    pomodoroLengthInSeconds: z.number(),
    breakLengthInSeconds: z.number().default(5 * 60),
    sessionStartedOn: z.string(),
});

interface TimerSettings {
    sessionLengthInSeconds: number;
    numberOfSessions: number;
    breakLengthInSeconds: number;
}

interface TimerState extends TimerSettings {
    backgroundImagePath: string | null;
    accentColor: string | null;

    setBackgroundImagePath: (path: string) => Promise<void>;
    setAccentColor: (hex: string) => Promise<void>;
    setTimerSettings: (settings: Partial<TimerSettings>) => Promise<void>;
}

interface SettingsState {
    isHydrated: boolean;
}

export const useTimerStore = create<TimerState>(set => ({
    backgroundImagePath: null,
    accentColor: null,
    sessionLengthInSeconds: 25 * 60,
    numberOfSessions: 2,
    breakLengthInSeconds: 5 * 60,

    setBackgroundImagePath: async path => {
        set({ backgroundImagePath: path });
        const store = await loadStore();
        await store.set("timer.backgroundImagePath", path);
    },

    setAccentColor: async hex => {
        set({ accentColor: hex });
        const store = await loadStore();
        await store.set("timer.accentColor", hex);
    },

    setTimerSettings: async settings => {
        set(state => ({
            ...state,
            ...settings,
        }));
        const store = await loadStore();
        await store.set("timer.settings", settings);
    },
}));

interface ChartState {
    minimumActivityDuration: number;
    chartHistory: SessionHistory[];
    setMinimumActivityDuration: (duration: number) => void;
    addToChartHistory: (chart: SessionHistory) => void;
    deleteChart: (id: string) => Promise<void>;
}

export const useChartStore = create<ChartState>(set => ({
    minimumActivityDuration: defaults.minimumActivityDuration,
    chartHistory: [],

    setMinimumActivityDuration: async (duration: number) => {
        set({ minimumActivityDuration: duration });
        const store = await loadStore();
        await store.set("chart.minimumActivityDuration", duration);
    },
    addToChartHistory: async (chart: SessionHistory) => {
        if (!!chart.chartData) {
            set(state => ({
                chartHistory: [...state.chartHistory, chart],
            }));

            const chartStore = await loadChartStore();
            await chartStore.set(chart.id, chart);

            let chartIDs = await chartStore.get("chart_ids");

            if (!chartIDs) {
                chartIDs = [];
            }

            let chartIDsResult = z.array(z.string()).safeParse(chartIDs);
            if (chartIDsResult.success) {
                await chartStore.set("chart_ids", [...chartIDsResult.data, chart.id]);
            }
        }
    },
    deleteChart: async (id: string) => {
        set(state => {
            let chartHistory = [...state.chartHistory];

            return { chartHistory: chartHistory.filter(chart => chart.id !== id) };
        });

        const chartStore = await loadChartStore();
        let chartIDs = await chartStore.get("chart_ids");

        let chartIDsResult = z.array(z.string()).safeParse(chartIDs);
        if (chartIDsResult.success) {
            let chartIDsResultFiltered = chartIDsResult.data.filter(chartID => chartID !== id);
            await chartStore.set("chart_ids", chartIDsResultFiltered);
        }

        await chartStore.delete(id);
    },
}));

export const useSettingsStore = create<SettingsState>()(() => ({
    isHydrated: false,
}));

export const hydrateSettings = async () => {
    try {
        await hydrateTimerSetting();
        await hydrateChartSetting();

        useSettingsStore.setState({ isHydrated: true });
    } catch (error) {
        console.error("Failed to hydrate settings:", error);
    }
};

async function hydrateChartSetting() {
    const store = await loadStore();
    const chartStore = await loadChartStore();

    const minimumActivityDuration = await store.get("chart.minimumActivityDuration");
    const chartResults = chartSettingsSchema.safeParse({ minimumActivityDuration });

    if (chartResults.success) {
        useChartStore.setState({
            minimumActivityDuration: chartResults.data.minimumActivityDuration,
        });
    }

    const chartIDs = await chartStore.get("chart_ids");
    const chartIDsResult = z.array(z.string()).safeParse(chartIDs);

    if (chartIDsResult.success) {
        let chartPromises = chartIDsResult.data.map(id => {
            return chartStore.get(id);
        });

        let chartHistory = await Promise.all(chartPromises);

        if (chartHistory.length > 0) {
            let chartHistoryResult = z.array(chartHistorySchema).safeParse(chartHistory);

            if (chartHistoryResult.success) {
                let chartHistory = chartHistoryResult.data.map(chart => {
                    let map = new Map<string, { range: [number, number]; title: string }[]>(
                        Object.entries(chart.chartData)
                    );

                    return new SessionHistory(
                        chart.pomodoroLengthInSeconds,
                        chart.breakLengthInSeconds,
                        new Date(chart.sessionStartedOn),
                        chart.id,
                        map
                    );
                });

                useChartStore.setState({ chartHistory });
            }
        }
    }
}

async function hydrateTimerSetting() {
    const store = await loadStore();

    const backgroundImagePath = await store.get("timer.backgroundImagePath");
    const accentColor = await store.get("timer.accentColor");

    const appearanceResult = appearanceSettingsSchema.safeParse({
        backgroundImagePath,
        accentColor,
    });

    if (appearanceResult.success) {
        useTimerStore.setState({
            backgroundImagePath: appearanceResult.data.backgroundImagePath,
            accentColor: appearanceResult.data.accentColor,
        });
    }

    const savedTimerSettings = await store.get("timer.settings");
    const timerResult = timerSettingsSchema.safeParse(savedTimerSettings);

    if (timerResult.success) {
        useTimerStore.setState(timerResult.data);
    }
}
