import { create } from "zustand";

type streamStatus = "not-started" | "streaming" | "stopped";

interface streamStoreType {
    streamStatus: streamStatus;
    changeStreamStatus: (status?: streamStatus) => void;
}

const useStreamStore = create<streamStoreType>()(set => ({
    streamStatus: "not-started",
    changeStreamStatus: status => {
        if (status) {
            set({ streamStatus: status });
            return;
        }
        set(state => {
            switch (state.streamStatus) {
                case "not-started":
                case "stopped":
                    return { streamStatus: "streaming" };
                case "streaming":
                    return { streamStatus: "stopped" };
            }
        });
    },
}));

export default useStreamStore;
