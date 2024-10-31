import { ForwardedRef, forwardRef, memo, useState } from "react";
import { Clock, Settings2, ChartGantt } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import TimerDialog from "./TimerDialog";
import ChartDialog from "./ChartDialog";

interface SettingMenuProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    handleDialogOpen: (dialogName: string) => void;
}

const MemoizedSetting = memo(Setting);

function Setting() {
    const [open, setOpen] = useState<boolean>(false);
    const [activeDialog, setActiveDialog] = useState<string | null>(null);

    const handleDialogOpen = (dialogName: string) => {
        setActiveDialog(dialogName);
    };

    const handleDialogChange = (open: boolean) => {
        if (open === false) {
            setActiveDialog(null);
        }
    };

    return (
        <>
            <div className="fixed top-5 right-9 z-50">
                <SettingMenu open={open} onOpenChange={setOpen} handleDialogOpen={handleDialogOpen}>
                    <SettingsButton />
                </SettingMenu>
            </div>

            {activeDialog === "timer" && (
                <TimerDialog activeDialog={activeDialog} handleDialogChange={handleDialogChange} />
            )}

            {activeDialog === "chart" && (
                <ChartDialog activeDialog={activeDialog} handleDialogChange={handleDialogChange} />
            )}
        </>
    );
}

const SettingsButton = forwardRef((props, forwardRef: ForwardedRef<HTMLButtonElement>) => {
    return (
        <button
            className="inline-flex items-center justify-center rounded-md transition-colorsring-offset-background hover:bg-accent hover:text-accent-foreground h-8 w-8 bg-background border"
            type="button"
            aria-label="Settings"
            {...props}
            ref={forwardRef}
        >
            <Settings2 className="h-4 w-4" strokeWidth={2} />
            <span className="sr-only">Settings</span>
        </button>
    );
});

function SettingMenu({ children, open, onOpenChange, handleDialogOpen }: SettingMenuProps) {
    return (
        <DropdownMenu open={open} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side="bottom">
                <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => handleDialogOpen("timer")}>
                        <Clock className="mr-1 h-4 w-4" />
                        <span>Timer</span>
                        <DropdownMenuShortcut className="font-mono"></DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={() => handleDialogOpen("chart")}>
                        <ChartGantt className="mr-1 h-4 w-4" />
                        <span>Chart</span>
                        <DropdownMenuShortcut className="font-mono"></DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default MemoizedSetting;
