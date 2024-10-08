import { create } from "zustand";

interface chartSizeStoreType {
    width: number;
    height: number;
    changeSize: (width: number, height: number) => void;
}

const useChatSizeStore = create<chartSizeStoreType>()((set) => ({
    width: 0,
    height: 0,
    changeSize: (width, height) => set(() => ({ width, height })),
}));

export default useChatSizeStore;
