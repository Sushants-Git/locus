export type AlertType = "error" | "warning" | "info";

export interface AlertProps {
    type: AlertType;
    title: string;
    message: string;
    onClose?: () => void;
}
