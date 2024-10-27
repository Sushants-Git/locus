import { create } from "zustand";

type streamStatus = "idle" | "streaming" | "stopped";

interface streamStoreType {
    streamStatus: streamStatus;
    changeStreamStatus: (status?: streamStatus) => void;
}

const useStreamStore = create<streamStoreType>()(set => ({
    streamStatus: "idle",
    changeStreamStatus: status => {
        if (status) {
            set({ streamStatus: status });
            return;
        }
        set(state => {
            switch (state.streamStatus) {
                case "idle":
                case "stopped":
                    return { streamStatus: "streaming" };
                case "streaming":
                    return { streamStatus: "stopped" };
            }
        });
    },
}));

export default useStreamStore;
