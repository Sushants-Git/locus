import { useMemo, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { timeDiff } from "../../src/utils/utils";
import { useTimerStore } from "../stores/settingStore";
import { defaults } from "../constants";

import { Card, CardContent } from "@/components/ui/card";
import { SessionHistory } from "../model/SessionHistory";
import { useShallow } from "zustand/react/shallow";
import { ChevronRight } from "lucide-react";

type Range = [start: number, end: number];

export type TitleRanges = {
    title: string;
    range: Range;
};

export default function Chart({ chart }: { chart: SessionHistory }) {
    return <>{chart.chartData && <ChartGenerator data={chart.chartData} />}</>;
}

const ChartGenerator = ({ data }: { data: Map<string, TitleRanges[]> }) => {
    const divRef = useRef<HTMLDivElement | null>(null);

    return (
        <div className="w-screen">
            <div className="w-3/4 m-auto bg-white dark:bg-zinc-900 rounded-lg" ref={divRef}>
                <Card>
                    <CardContent className="py-7 px-6">
                        <TimelineChart data={data} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

function TimelineChart({ data }: { data: Map<string, TitleRanges[]> }) {
    const timelineRows = Array.from(data).map(([windowClass, titleRanges]) => (
        <div className="flex items-center gap-5" key={windowClass}>
            <div className="w-28 truncate select-none text-sm font-500 dark:font-300">
                {windowClass.charAt(0).toUpperCase() + windowClass.slice(1)}
            </div>
            <TimelineRow titleRanges={titleRanges} />
        </div>
    ));

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">{timelineRows}</div>
        </div>
    );
}

function TimelineRow({ titleRanges }: { titleRanges: TitleRanges[] }) {
    const timeBars = () => {
        const timeBars = [];
        let i = 0;

        while (i < titleRanges.length) {
            let currentRange: Range = [...titleRanges[i].range];
            const previousRange = i > 0 ? titleRanges[i - 1].range : null;

            let barDetails = [titleRanges[i]];

            // Merge consecutive ranges if they are contiguous
            // [10,20], [20,40], [40,60] -> [10,60]
            while (
                i + 1 < titleRanges.length &&
                titleRanges[i].range[1] === titleRanges[i + 1].range[0]
            ) {
                currentRange[1] = titleRanges[i + 1].range[1];
                barDetails.push(titleRanges[i + 1]);
                i++;
            }

            timeBars.push(
                <TimelineRangeBars
                    key={i}
                    previousRange={previousRange}
                    currentRange={currentRange}
                    barDetails={barDetails}
                />
            );

            i++;
        }

        return timeBars;
    };

    return <div className="flex flex-1">{timeBars()}</div>;
}

function TimelineRangeBars({
    previousRange,
    currentRange,
    barDetails,
}: {
    previousRange: Range | null;
    currentRange: Range;
    barDetails: TitleRanges[];
}) {
    const { sessionLengthInSeconds, numberOfSessions, breakLengthInSeconds } = useTimerStore(
        useShallow(state => ({
            sessionLengthInSeconds: state.sessionLengthInSeconds,
            numberOfSessions: state.numberOfSessions,
            breakLengthInSeconds: state.breakLengthInSeconds,
        }))
    );

    let totalLength =
        sessionLengthInSeconds * numberOfSessions + breakLengthInSeconds * numberOfSessions;

    const calculateBarWidth = (range: Range) => {
        return (rangeDifference(range) / totalLength) * 100;
    };

    const rangeDifference = (range: Range) => {
        return range[1] - range[0];
    };

    if (!previousRange && currentRange[0] === 0) {
        return (
            <TimelineBarWithToolTip
                width={calculateBarWidth(currentRange)}
                barDetails={barDetails}
            />
        );
    }

    if (!previousRange) {
        return (
            <>
                <TimelineBar width={calculateBarWidth([0, currentRange[0]])} barStatus="inactive" />
                <TimelineBarWithToolTip
                    width={calculateBarWidth(currentRange)}
                    barDetails={barDetails}
                />
            </>
        );
    }

    return (
        <>
            <TimelineBar
                width={calculateBarWidth([previousRange[1], currentRange[0]])}
                barStatus="inactive"
            />
            <TimelineBarWithToolTip
                width={calculateBarWidth(currentRange)}
                barDetails={barDetails}
            />
        </>
    );
}

const TimelineBarWithToolTip = ({
    width,
    barDetails,
}: {
    width: number;
    barDetails: TitleRanges[];
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const ToolTipItem = ({ title, range }: { title: string; range: Range }) => (
        <div className="flex justify-between gap-6 select-text">
            <div className="text-sm truncate max-w-56">{title}</div>
            <div className="text-sm tabular-nums font-bricolage-grotesque">
                {timeDiff(range[0], range[1])}
            </div>
        </div>
    );

    const toolTipContent = useMemo(
        () => (
            <div className="flex flex-col space-y-1">
                {barDetails.slice(0, 3).map(({ title, range }, index) => (
                    <ToolTipItem key={index} title={title} range={range} />
                ))}
                {barDetails.length > 3 && (
                    <button
                        key="show-more"
                        className="flex items-center text-sm text-muted-foreground hover:text-primary mt-2 w-full"
                        onClick={e => {
                            e.stopPropagation();
                            setIsDialogOpen(true);
                        }}
                    >
                        <span>Show {barDetails.length - 3} more items</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                )}
            </div>
        ),
        [barDetails]
    );

    const allDetailsContent = useMemo(
        () =>
            barDetails.map(({ title, range }, index) => (
                <ToolTipItem key={index} title={title} range={range} />
            )),
        [barDetails]
    );

    return (
        <>
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger className="relative" style={{ width: `${width}%` }}>
                        <TimelineBar width={100} barStatus="active" />
                    </TooltipTrigger>
                    <TooltipContent className="p-3 rounded-lg max-w-xs">
                        {toolTipContent}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Timeline Details</DialogTitle>
                        <DialogDescription>Shows timeline details</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-72 rounded-md p-4 border">
                        <div className="space-y-2">{allDetailsContent}</div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
};

function TimelineBar({ width, barStatus }: { width: number; barStatus: "active" | "inactive" }) {
    const accentColor = useTimerStore(state => state.accentColor);

    if (width === 0) return null;

    const isActive = barStatus === "active";
    const defaultColor = defaults.accentColor;
    const backgroundColor = isActive ? accentColor || defaultColor : "white";

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isActive) {
            e.currentTarget.style.backgroundColor = darkenHexColor(accentColor || defaultColor, 20);
        }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isActive) {
            e.currentTarget.style.backgroundColor = backgroundColor;
        }
    };

    return (
        <div
            style={{ width: `${width}%`, backgroundColor }}
            className={`h-5 rounded-sm transition-colors duration-100 ${isActive ? "cursor-pointer" : "opacity-0"}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        />
    );
}

function darkenHexColor(hex: string, percentage: number) {
    hex = hex.replace(/^#/, "");

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.max(0, Math.min(255, r - Math.round(r * (percentage / 100))));
    g = Math.max(0, Math.min(255, g - Math.round(g * (percentage / 100))));
    b = Math.max(0, Math.min(255, b - Math.round(b * (percentage / 100))));

    const darkenedHex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

    return darkenedHex;
}
