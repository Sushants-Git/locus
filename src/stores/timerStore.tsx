import { create } from "zustand";

interface timerStoreType {
    backgroundImagePath: string | null;
    changeBackgroundImagePath: (path: string) => void;
}

const useTimerStore = create<timerStoreType>()(set => ({
    backgroundImagePath: null,
    changeBackgroundImagePath: (path: string) =>
        set(state => ({ ...state, backgroundImagePath: path })),
}));

export default useTimerStore;
