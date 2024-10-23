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

type TimerStatus = "idle" | "running" | "paused" | "break" | "ended" | "completed";

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
    timerStatus: TimerStatus;

    setBackgroundImagePath: (path: string) => Promise<void>;
    setAccentColor: (hex: string) => Promise<void>;
    setTimerStatus: (status: TimerStatus) => void;
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
    timerStatus: "idle",

    setBackgroundImagePath: async path => {
        set({ backgroundImagePath: path });
        await store.set("timer.backgroundImagePath", path);
    },

    setAccentColor: async hex => {
        set({ accentColor: hex });
        await store.set("timer.accentColor", hex);
    },

    setTimerStatus: status => {
        set({ timerStatus: status });
    },

    setTimerSettings: async settings => {
        set(state => ({
            ...state,
            ...settings,
        }));
        await store.set("timer.settings", settings);
    },
}));

export const useSettingsStore = create<SettingsState>()(() => ({
    isHydrated: false,
}));

export const hydrateSettings = async () => {
    try {
        const backgroundImagePath = await store.get("timer.backgroundImagePath");
        const accentColor = await store.get("timer.accentColor");

        const appearanceResult = appearanceSettingsSchema.safeParse({
            backgroundImagePath,
            accentColor,
        });

        const savedSettings = await store.get("timer.settings");
        const timerResult = timerSettingsSchema.safeParse(savedSettings);

        console.log(timerResult);

        if (appearanceResult.success) {
            useTimerStore.setState({
                backgroundImagePath: appearanceResult.data.backgroundImagePath,
                accentColor: appearanceResult.data.accentColor,
            });
        }

        if (timerResult.success) {
            useTimerStore.setState(timerResult.data);
        }

        useSettingsStore.setState({ isHydrated: true });
    } catch (error) {
        console.error("Failed to hydrate settings:", error);
    }
};
