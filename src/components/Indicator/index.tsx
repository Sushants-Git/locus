import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { customIconMap, genericIconMap } from "./icon-set";
import { CircleDashed } from "lucide-react";

import { useWindowTitleStream } from "../../hooks/useWindowTitleStream";
import { memo, useMemo } from "react";
import { useTimerStore } from "../../stores/settingStore";
import { defaults } from "../../constants";

const MemoizedIndicator = memo(Indicator);

function Indicator() {
    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex justify-center mx-auto items-center w-max">
                        <IndicatorButton />
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs mb-1">
                    <p>
                        This indicator shows the current active window, when the Pomodoro is
                        running.
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

const IndicatorButton = () => {
    const { activeWindow, isStreamRunning } = useWindowTitleStream();
    const accentColor = useTimerStore(state => state.accentColor);

    let windowName = activeWindow.windowName;

    let memoizedWindowName = useMemo(() => {
        return windowName.split(" ").slice(0, 3).join(" ").toLowerCase();
    }, [windowName]);

    return (
        <Button
            className="rounded-full flex items-center gap-2 transition-colors duration-300 hover:bg-primary cursor-default dark:bg-background border"
            style={{
                backgroundColor: isStreamRunning() ? accentColor || defaults.accentColor : "",
            }}
            // onClick={() => {
            //     changeStreamStatus();
            // }}
        >
            <div>
                <Logo windowName={memoizedWindowName} />
            </div>
            <span className="max-w-40 truncate dark:text-white">{activeWindow.title}</span>
        </Button>
    );
};

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

export default MemoizedIndicator;
