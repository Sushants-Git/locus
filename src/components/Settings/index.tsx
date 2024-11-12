import { ForwardedRef, forwardRef, memo, useState } from "react";
import { Clock, ChartGantt } from "lucide-react";
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
import { Button } from "@/components/ui/button";

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
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Button
            className="group h-8 w-8"
            variant="outline"
            size="icon"
            onClick={() => setOpen(prevState => !prevState)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            ref={forwardRef}
            {...props}
        >
            <svg
                className="pointer-events-none"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                />
                <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                />
                <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                />
            </svg>
        </Button>
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
