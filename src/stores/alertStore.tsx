import { AlertProps } from "src/model/AlertTypes";
import { create } from "zustand";

interface AlertStoreType {
    alert: AlertProps | null;
    showAlert: (alert: AlertProps) => void;
    clearAlert: () => void;
}

const useAlertStore = create<AlertStoreType>()(set => ({
    alert: null,
    showAlert: (alert: AlertProps) => {
        set({ alert });
    },
    clearAlert: () => {
        set(state => {
            if (state.alert?.onClose) state.alert.onClose();
            return { alert: null };
        });
    },
}));

export default useAlertStore;
