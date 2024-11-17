import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

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
                    icon: <AlertCircle className="h-5 w-5 text-red-700 dark:text-red-500" />,
                    className:
                        "border-red-500 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-200",
                };
            case "warning":
                return {
                    icon: (
                        <AlertTriangle className="h-5 w-5 text-yellow-700 dark:text-yellow-500" />
                    ),
                    className:
                        "border-yellow-500 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
                };
            case "info":
                return {
                    icon: <Info className="h-5 w-5 text-blue-700 dark:text-blue-500" />,
                    className:
                        "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-200",
                };
            default:
                return {
                    icon: <Info className="h-5 w-5 text-gray-700 dark:text-gray-400" />,
                    className:
                        "border-gray-500 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",
                };
        }
    };

    const { icon, className } = getAlertStyle(type);

    return (
        <AnimatePresence>
            {message && (
                <div className="fixed inset-0 flex items-center justify-center z-60">
                    <motion.div
                        ref={alertRef}
                        className="max-w-md w-full"
                        role="alert"
                        aria-live="assertive"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <Alert className={`${className} shadow-lg rounded-lg p-4`}>
                            <div className="flex items-center space-x-3">
                                {icon}
                                <div>
                                    <AlertTitle className="text-lg font-semibold">
                                        {title}
                                    </AlertTitle>
                                    <AlertDescription className="text-sm">
                                        {message}
                                    </AlertDescription>
                                </div>
                            </div>
                        </Alert>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// BUG : if a timer dialog is open and then this alert opens, and if we click outside of timer alert the timer dialog closes instead of this alert
