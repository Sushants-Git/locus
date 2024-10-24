import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { customIconMap, genericIconMap } from "./icon-set";
import { CircleDashed } from "lucide-react";

import { useWindowTitleStream } from "../../hooks/useWindowTitleStream";
import { ForwardedRef, forwardRef, memo, useMemo } from "react";
import { useTimerStore } from "../../stores/settingStore";
import { defaults } from "../../constants";

export default function Indicator() {
    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <IndicatorButton />
                </TooltipTrigger>
                <TooltipContent className="shadow-none">
                    <p>
                        Start the Pomodoro timer ⏳, and I'll let you know which window you're
                        hovering over!
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

const IndicatorButton = forwardRef((_, forwardRef: ForwardedRef<HTMLButtonElement>) => {
    const { activeWindow, isStreamRunning } = useWindowTitleStream();
    const accentColor = useTimerStore(state => state.accentColor);

    let windowName = activeWindow.windowName;

    let memoizedWindowName = useMemo(() => {
        return windowName.split(" ").slice(0, 3).join(" ").toLowerCase();
    }, [windowName]);

    return (
        <div className="flex justify-center mb-4 items-center">
            <Button
                className="rounded-full flex items-center gap-2 transition-colors duration-300"
                style={{
                    backgroundColor: isStreamRunning() ? accentColor || defaults.accentColor : "",
                }}
                ref={forwardRef}
                // onClick={() => {
                //     changeStreamStatus();
                // }}
            >
                <div>
                    <Logo windowName={memoizedWindowName} />
                </div>
                <span>{activeWindow.title}</span>
            </Button>
        </div>
    );
});

const Logo = memo(({ windowName }: { windowName: string }) => {
    let windowNameParts = windowName.split(" ");

    for (const name of windowNameParts) {
        const Icon = customIconMap.get(name);
        if (Icon) {
            return <Icon className="text-white h-5 w-5" strokeWidth={1} />;
        }
    }

    for (const [genericIconName, Icon] of genericIconMap.entries()) {
        if (windowName.includes(genericIconName)) {
            return <Icon className="text-white h-5 w-5" strokeWidth={1} />;
        }
    }

    return <CircleDashed className="text-white h-5 w-5" strokeWidth={1} />;
});
