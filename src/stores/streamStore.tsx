import { create } from "zustand";

interface streamStoreType {
    streamStatus: "not-started" | "streaming" | "stopped";
    changeStreamStatus: () => void;
}

const useStreamStore = create<streamStoreType>()((set) => ({
    streamStatus: "not-started",
    changeStreamStatus: () =>
        set((state) => {
            switch (state.streamStatus) {
                case "not-started":
                case "stopped":
                    return { streamStatus: "streaming" };
                case "streaming":
                    return { streamStatus: "stopped" };
            }
        }),
}));

export default useStreamStore;
