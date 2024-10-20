import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useEffect, useRef } from "react";

import useAlertStore from "../stores/alertStore";
import { AlertProps, AlertType } from "src/model/AlertTypes";

export default function CenteredAlert({ type, message, title }: AlertProps) {
    const alertRef = useRef<HTMLDivElement>(null);
    const closeAlert = useAlertStore(state => state.clearAlert);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (alertRef.current && !alertRef.current.contains(event.target as Node)) {
                closeAlert();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getAlertStyle = (type: AlertType) => {
        switch (type) {
            case "error":
                return {
                    icon: <AlertCircle className="h-4 w-4" />,
                    className: "border-red-500 bg-red-50 text-red-700",
                };
            case "warning":
                return {
                    icon: <AlertTriangle className="h-4 w-4" />,
                    className: "border-yellow-500 bg-yellow-50 text-yellow-700",
                };
            case "info":
                return {
                    icon: <Info className="h-4 w-4" />,
                    className: "border-blue-500 bg-blue-50 text-blue-700",
                };
            default:
                return {
                    icon: <Info className="h-4 w-4" />,
                    className: "border-gray-500 bg-gray-50 text-gray-700",
                };
        }
    };

    const { icon, className } = getAlertStyle(type);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={e => e.stopPropagation()}
        >
            <div
                ref={alertRef}
                className="max-w-md w-full animate-fade-in"
                role="alert"
                aria-live="assertive"
                onClick={e => e.stopPropagation()}
            >
                <Alert className={`${className} shadow-lg`}>
                    {icon}
                    <AlertTitle>{title}</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            </div>
        </div>
    );
}
