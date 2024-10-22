import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";
import { z } from "zod";

const store = await Store.load("settings.json", { autoSave: true });

type SettingStoreType = {
    _settingHydrate: boolean;
};

type TimerStoreType = {
    backgroundImagePath: string | null;
    accentColor: string | null;

    sessionLengthInSeconds: number;
    numberOfSessions: number;
    breakLengthInSeconds: number;
    // idle: Before starting any session.
    // running: Timer is actively counting down for a Pomodoro session.
    // paused: The session is paused.
    // break: Timer is on a break (either short or long break).
    // ended: The current Pomodoro session has ended.
    // completed: The entire Pomodoro session cycle (e.g., 4 sessions) has been finished.
    timerStatus: "idle" | "running" | "paused" | "break" | "ended" | "completed";

    setBackgroundImagePath: (path: string) => Promise<void>;
    setAccentColor: (hex: string) => Promise<void>;
    setTimerStatus: (status: TimerStoreType["timerStatus"]) => void;
    setTimerInitials: (time: {
        sessionLengthInSeconds?: number;
        numberOfSessions?: number;
        breakLengthInSeconds?: number;
    }) => void;
};

const useTimerStore = create<TimerStoreType>()(set => ({
    backgroundImagePath: null,
    accentColor: null,

    sessionLengthInSeconds: 25 * 60,
    numberOfSessions: 2,
    breakLengthInSeconds: 5 * 60,
    timerStatus: "idle",

    setBackgroundImagePath: async (path: string) => {
        set(() => ({ backgroundImagePath: path }));
        await store.set("timer-background-image-path", path);
    },
    setAccentColor: async (hex: string) => {
        set(() => ({ accentColor: hex }));
        await store.set("timer-accent-color", hex);
    },
    setTimerStatus: status => {
        set(() => ({ timerStatus: status }));
    },
    setTimerInitials: time => {
        set(() => ({ ...time }));
    },
}));

const useSettingStore = create<SettingStoreType>()(() => ({
    _settingHydrate: false,
}));

const hydrateSettings = async () => {
    const backgroundImagePath = z
        .string()
        .safeParse(await store.get("timer-background-image-path"));

    const accentColor = z.string().safeParse(await store.get("timer-accent-color"));

    const sessionLength = z.number().safeParse(await store.get("timer-session-length"));
    const numberOfSessions = z.number().safeParse(await store.get("timer-number-of-sessions"));
    const breakLength = z.number().safeParse(await store.get("timer-break-length"));

    if (backgroundImagePath.success) {
        useTimerStore.setState({ backgroundImagePath: backgroundImagePath.data });
    }

    if (accentColor.success) {
        useTimerStore.setState({ accentColor: accentColor.data });
    }

    if (sessionLength.success) {
        useTimerStore.setState({ sessionLengthInSeconds: sessionLength.data });
    }

    if (numberOfSessions.success) {
        useTimerStore.setState({ numberOfSessions: numberOfSessions.data });
    }

    if (breakLength.success) {
        useTimerStore.setState({ breakLengthInSeconds: breakLength.data });
    }

    useSettingStore.setState({ _settingHydrate: true });
};

export { useTimerStore, useSettingStore, hydrateSettings };
