import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";
import { z } from "zod";

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
    minimumActivityDuration: z.number().min(1).default(30),
});

const STORE_NAME = "settings.json";
const store = await Store.load(STORE_NAME, { autoSave: true });

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
        await store.set("timer.backgroundImagePath", path);
    },

    setAccentColor: async hex => {
        set({ accentColor: hex });
        await store.set("timer.accentColor", hex);
    },

    setTimerSettings: async settings => {
        set(state => ({
            ...state,
            ...settings,
        }));
        await store.set("timer.settings", settings);
    },
}));

interface ChartState {
    minimumActivityDuration: number;
    setMinimumActivityDuration: (duration: number) => void;
}

export const useChartStore = create<ChartState>(set => ({
    minimumActivityDuration: 30,
    setMinimumActivityDuration: async (duration: number) => {
        set({ minimumActivityDuration: duration });
        await store.set("chart.minimumActivityDuration", duration);
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
    const savedChartSettings = await store.get("chart.minimumActivityDuration");
    const chartResults = chartSettingsSchema.safeParse(savedChartSettings);

    if (chartResults.success) {
        useChartStore.setState({
            minimumActivityDuration: chartResults.data.minimumActivityDuration,
        });
    }
}

async function hydrateTimerSetting() {
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
