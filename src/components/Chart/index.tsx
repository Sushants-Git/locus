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
import { timeDiff } from "../../../src/utils/utils";
import { useChartStore, useTimerStore } from "../../stores/settingStore";
import { defaults } from "../../constants";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Range, SessionHistory, TitleRanges } from "../../model/SessionHistory";
import { ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MinimumActivityDuration from "./MinimumActivityDuration";
import { ChartPlaceholder } from "./ChartPlaceholder";
import ChartNavigation from "./Navigation";

export default function Chart({ chart }: { chart: SessionHistory }) {
    const [showingHistory, setShowingHistory] = useState(false);
    const [historyIndex, setHistoryIndex] = useState(0);

    const chartHistory = useChartStore(state => state.chartHistory);
    const deleteChart = useChartStore(state => state.deleteChart);

    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < chartHistory.length - 1;

    const handleBack = () => {
        if (!showingHistory) {
            setShowingHistory(true);
            setHistoryIndex(chartHistory.length - 1);
        } else if (canGoBack) {
            setHistoryIndex(prev => prev - 1);
        }
    };

    const handleForward = () => {
        if (canGoForward) {
            setHistoryIndex(prev => prev + 1);
        } else if (showingHistory) {
            setShowingHistory(false);
        }
    };

    const handleDelete = async () => {
        await deleteChart(chartHistory[historyIndex].id);
        if (historyIndex > 0) {
            handleBack();
        } else if (chartHistory.length !== 1) {
        } else {
            setShowingHistory(false);
            setHistoryIndex(0);
        }
    };

    return (
        <div className="w-screen">
            <ChartNavigation
                chartHistory={chartHistory}
                showingHistory={showingHistory}
                historyIndex={historyIndex}
                onBack={handleBack}
                onForward={handleForward}
                onDelete={handleDelete}
            />

            <ChartDisplay
                showingHistory={showingHistory}
                chartHistory={chartHistory}
                historyIndex={historyIndex}
                currentChart={chart}
            />
        </div>
    );
}

interface ChartDisplayType {
    showingHistory: boolean;
    chartHistory: SessionHistory[];
    historyIndex: number;
    currentChart: SessionHistory;
}

const ChartDisplay = ({
    showingHistory,
    chartHistory,
    historyIndex,
    currentChart,
}: ChartDisplayType) => {
    const getActiveChart = () => {
        if (showingHistory) {
            return chartHistory[historyIndex];
        }
        return currentChart;
    };

    const activeChart = getActiveChart();

    return (
        <div className="w-full">
            {activeChart?.chartData ? (
                <ChartGenerator
                    data={activeChart.chartData}
                    pomodoroLength={activeChart.pomodoroLengthInSeconds}
                />
            ) : (
                <ChartPlaceholder />
            )}
        </div>
    );
};

const ChartGenerator = ({
    data,
    pomodoroLength,
}: {
    data: Map<string, TitleRanges[]>;
    pomodoroLength: number;
}) => {
    const divRef = useRef<HTMLDivElement | null>(null);

    return (
        <div className="w-screen">
            <div className="w-3/4 m-auto bg-white dark:bg-zinc-900 rounded-lg" ref={divRef}>
                <Card>
                    <CardContent className="py-7 px-6 pb-3">
                        <TimelineChart data={data} pomodoroLength={pomodoroLength} />
                    </CardContent>

                    <CardFooter className="flex justify-between items-center">
                        <MinimumActivityDuration />
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

function TimelineChart({
    data,
    pomodoroLength,
}: {
    data: Map<string, TitleRanges[]>;
    pomodoroLength: number;
}) {
    const timelineRows = Array.from(data).map(([windowClass, titleRanges]) => (
        <div className="flex items-center gap-5" key={windowClass}>
            <div className="w-28 truncate select-none text-sm font-500 dark:font-300">
                {windowClass.charAt(0).toUpperCase() + windowClass.slice(1)}
            </div>
            <TimelineRow titleRanges={titleRanges} pomodoroLength={pomodoroLength} />
        </div>
    ));

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">{timelineRows}</div>
        </div>
    );
}

function TimelineRow({
    titleRanges,
    pomodoroLength,
}: {
    titleRanges: TitleRanges[];
    pomodoroLength: number;
}) {
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
                    pomodoroLength={pomodoroLength}
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
    pomodoroLength,
}: {
    previousRange: Range | null;
    currentRange: Range;
    barDetails: TitleRanges[];
    pomodoroLength: number;
}) {
    const calculateBarWidth = (range: Range) => {
        return (rangeDifference(range) / pomodoroLength) * 100;
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
    const [condenseInfo, setCondenseInfo] = useState(true);
    const [order, setOrder] = useState(true);

    const ToolTipItem = ({ title, rangeDiff }: { title: string; rangeDiff: string }) => (
        <div className="flex justify-between gap-6 select-text">
            <div className="text-sm truncate max-w-56">{title}</div>
            <div className="text-sm flex-shrink-0 tabular-nums text-muted-foreground">
                {rangeDiff}
            </div>
        </div>
    );

    const toolTipContent = useMemo(
        () => (
            <div className="flex flex-col space-y-1">
                {barDetails.slice(0, 3).map(({ title, range }, index) => (
                    <ToolTipItem
                        key={index}
                        title={title}
                        rangeDiff={timeDiff(range[0], range[1])}
                    />
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

    const uncondensedContent = useMemo(() => {
        if (order) {
            return [...barDetails]
                .sort(
                    (a, b) => Math.abs(b.range[1] - b.range[0]) - Math.abs(a.range[1] - a.range[0])
                )
                .map(({ title, range }, index) => (
                    <ToolTipItem
                        key={index}
                        title={title}
                        rangeDiff={timeDiff(range[0], range[1])}
                    />
                ));
        } else {
            return [...barDetails].map(({ title, range }, index) => (
                <ToolTipItem key={index} title={title} rangeDiff={timeDiff(range[0], range[1])} />
            ));
        }
    }, [barDetails, order]);

    const condensedContent = useMemo(() => {
        const titleGroups = new Map<string, number>();

        barDetails.forEach(item => {
            const rangeDiff = Math.abs(item.range[1] - item.range[0]);

            if (titleGroups.has(item.title)) {
                titleGroups.set(item.title, (titleGroups.get(item.title) ?? 0) + rangeDiff);
            } else {
                titleGroups.set(item.title, rangeDiff);
            }
        });

        if (order) {
            return Array.from(titleGroups)
                .sort((a, b) => b[1] - a[1])
                .map(([title, totalRangeDiff], index) => (
                    <ToolTipItem
                        key={index}
                        title={title}
                        rangeDiff={timeDiff(0, totalRangeDiff)}
                    />
                ));
        } else {
            return Array.from(titleGroups).map(([title, totalRangeDiff], index) => (
                <ToolTipItem key={index} title={title} rangeDiff={timeDiff(0, totalRangeDiff)} />
            ));
        }
    }, [barDetails, order]);

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
                    <ScrollArea className="max-h-72 rounded-md border">
                        <div className="space-y-2 p-4">
                            {condenseInfo ? condensedContent : uncondensedContent}
                        </div>
                    </ScrollArea>
                    <div>
                        <div className="space-y-3">
                            <div className="flex gap-2 items-center justify-between">
                                <Label htmlFor="condense-info">Condense Info</Label>
                                <Switch
                                    id="condense-info"
                                    checked={condenseInfo}
                                    onCheckedChange={setCondenseInfo}
                                />
                            </div>
                            <div className="flex gap-2 items-center justify-between">
                                <Label htmlFor="condense-info">Order</Label>
                                <Switch id="order" checked={order} onCheckedChange={setOrder} />
                            </div>
                        </div>
                    </div>
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
