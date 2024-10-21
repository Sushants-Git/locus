import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";
import { z } from "zod";

const store = await Store.load("settings.json", { autoSave: true });

type SettingStoreType = {
    _settingHydrate: boolean;
};

type TimerStoreType = {
    backgroundImagePath: string | null;
    setBackgroundImagePath: (path: string) => Promise<void>;
};

const useTimerStore = create<TimerStoreType>()(set => ({
    backgroundImagePath: null,
    setBackgroundImagePath: async (path: string) => {
        set(() => ({ backgroundImagePath: path }));
        await store.set("timer-background-image-path", path);
    },
}));

const useSettingStore = create<SettingStoreType>()(() => ({
    _settingHydrate: false,
}));

const hydrateSettings = async () => {
    const backgroundImagePath = z
        .string()
        .safeParse(await store.get("timer-background-image-path"));

    if (backgroundImagePath.success) {
        useTimerStore.setState({ backgroundImagePath: backgroundImagePath.data });
    }

    useSettingStore.setState({ _settingHydrate: true });
};

export { useTimerStore, useSettingStore, hydrateSettings };
