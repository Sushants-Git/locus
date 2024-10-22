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
    setBackgroundImagePath: (path: string) => Promise<void>;
    setAccentColor: (hex: string) => Promise<void>;
};

const useTimerStore = create<TimerStoreType>()(set => ({
    backgroundImagePath: null,
    accentColor: null,
    setBackgroundImagePath: async (path: string) => {
        set(() => ({ backgroundImagePath: path }));
        await store.set("timer-background-image-path", path);
    },
    setAccentColor: async (hex: string) => {
        set(() => ({ accentColor: hex }));
        await store.set("timer-accent-color", hex);
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

    if (backgroundImagePath.success) {
        useTimerStore.setState({ backgroundImagePath: backgroundImagePath.data });
    }

    if (accentColor.success) {
        useTimerStore.setState({ accentColor: accentColor.data });
    }

    useSettingStore.setState({ _settingHydrate: true });
};

export { useTimerStore, useSettingStore, hydrateSettings };
