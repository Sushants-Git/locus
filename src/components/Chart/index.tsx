import { useMemo, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { timeDiff } from "../../../src/utils/utils";
import { useChartStore, useTimerStore } from "../../stores/settingStore";
import { defaults } from "../../constants";

import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts";

import { Pie, PieChart } from "recharts";
import {
    Card,
    CardContent,
    CardFooter,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

import { Range, SessionHistory, TitleRanges } from "../../model/SessionHistory";
import { ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MinimumActivityDuration from "./MinimumActivityDuration";
import { ChartPlaceholder } from "./ChartPlaceholder";
import ChartNavigation from "./Navigation";

import { Button } from "@/components/ui/button";
import ChartSVG from "./icon-set";

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
                        <PerformanceMetrics data={data} />
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

const PerformanceMetrics = ({ data }: { data: Map<string, TitleRanges[]> }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    onClick={() => {
                        console.log("lol");
                    }}
                >
                    <ChartSVG className="h-5 w-5" strokeWidth={1} />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-3/5 min-w-[32rem] max-w-3/5">
                <DialogHeader>
                    <DialogTitle>Activity Detail</DialogTitle>
                    <DialogDescription>
                        Show you where and what you spent your time doing.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid">
                    <Metrics data={data} />
                </div>
                <Component />
            </DialogContent>
        </Dialog>
    );
};

export function Metrics({ data }: { data: Map<string, TitleRanges[]> }) {
    const chartData: { windowClass: string; totalTime: number; fill: string }[] = [];
    const chartConfig: ChartConfig = { totalTime: { label: "time (min)" } };

    Array.from(data).map(([windowClass, titleRanges], index) => {
        let totalTime = 0;
        titleRanges.forEach(a => (totalTime = totalTime + (a.range[1] - a.range[0])));
        chartData.push({
            windowClass,
            totalTime: Math.round((totalTime * 10) / 60) / 10,
            fill: `hsl(var(--chart-${index + 1}))`,
        });

        chartConfig[windowClass] = { label: windowClass };
    });

    return (
        <Card className="w-max border mt-3">
            <CardContent>
                <ChartContainer config={chartConfig} className="w-[400px] mt-8">
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="windowClass"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={value => {
                                return chartConfig[value as keyof typeof chartConfig]?.label;
                            }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar
                            dataKey="totalTime"
                            strokeWidth={2}
                            radius={8}
                            activeIndex={2}
                            activeBar={({ ...props }) => {
                                return (
                                    <Rectangle
                                        {...props}
                                        fillOpacity={0.8}
                                        stroke={props.payload.fill}
                                        strokeDasharray={4}
                                        strokeDashoffset={4}
                                        onClick={() => {
                                            console.log("clicked");
                                        }}
                                    />
                                );
                            }}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export const description = "An interactive bar chart"

const chartData = [
    { date: "2024-04-01", desktop: 222 },
    { date: "2024-04-02", desktop: 97 },
    { date: "2024-04-03", desktop: 167 },
    { date: "2024-04-04", desktop: 242 },
    { date: "2024-04-05", desktop: 373 },
    { date: "2024-04-06", desktop: 301 },
    { date: "2024-04-07", desktop: 245 },
    { date: "2024-04-08", desktop: 409 },
    { date: "2024-04-09", desktop: 59 },
    { date: "2024-04-10", desktop: 261 },
    { date: "2024-04-11", desktop: 327 },
    { date: "2024-04-12", desktop: 292 },
    { date: "2024-04-13", desktop: 342 },
    { date: "2024-04-14", desktop: 137 },
    { date: "2024-04-15", desktop: 120 },
    { date: "2024-04-16", desktop: 138 },
    { date: "2024-04-17", desktop: 446 },
    { date: "2024-04-18", desktop: 364 },
    { date: "2024-04-19", desktop: 243 },
    { date: "2024-04-20", desktop: 89 },
    { date: "2024-04-21", desktop: 137 },
    { date: "2024-04-22", desktop: 224 },
    { date: "2024-04-23", desktop: 138 },
    { date: "2024-04-24", desktop: 387 },
    { date: "2024-04-25", desktop: 215 },
    { date: "2024-04-26", desktop: 75 },
    { date: "2024-04-27", desktop: 383 },
    { date: "2024-04-28", desktop: 122 },
    { date: "2024-04-29", desktop: 315 },
    { date: "2024-04-30", desktop: 454 },
    { date: "2024-05-01", desktop: 165 },
    { date: "2024-05-02", desktop: 293 },
    { date: "2024-05-03", desktop: 247 },
    { date: "2024-05-04", desktop: 385 },
    { date: "2024-05-05", desktop: 481 },
    { date: "2024-05-06", desktop: 498 },
    { date: "2024-05-07", desktop: 388 },
    { date: "2024-05-08", desktop: 149 },
    { date: "2024-05-09", desktop: 227 },
    { date: "2024-05-10", desktop: 293 },
    { date: "2024-05-11", desktop: 335 },
    { date: "2024-05-12", desktop: 197 },
    { date: "2024-05-13", desktop: 197 },
    { date: "2024-05-14", desktop: 448 },
    { date: "2024-05-15", desktop: 473 },
    { date: "2024-05-16", desktop: 338 },
    { date: "2024-05-17", desktop: 499 },
    { date: "2024-05-18", desktop: 315 },
    { date: "2024-05-19", desktop: 235 },
    { date: "2024-05-20", desktop: 177 },
    { date: "2024-05-21", desktop: 82 },
    { date: "2024-05-22", desktop: 81 },
    { date: "2024-05-23", desktop: 252 },
    { date: "2024-05-24", desktop: 294 },
    { date: "2024-05-25", desktop: 201 },
    { date: "2024-05-26", desktop: 213 },
    { date: "2024-05-27", desktop: 420 },
    { date: "2024-05-28", desktop: 233 },
    { date: "2024-05-29", desktop: 78 },
    { date: "2024-05-30", desktop: 340 },
    { date: "2024-05-31", desktop: 178 },
    { date: "2024-06-01", desktop: 178 },
    { date: "2024-06-02", desktop: 470 },
    { date: "2024-06-03", desktop: 103 },
    { date: "2024-06-04", desktop: 439 },
    { date: "2024-06-05", desktop: 88 },
    { date: "2024-06-06", desktop: 294 },
    { date: "2024-06-07", desktop: 323 },
    { date: "2024-06-08", desktop: 385 },
    { date: "2024-06-09", desktop: 438 },
    { date: "2024-06-10", desktop: 155 },
    { date: "2024-06-11", desktop: 92 },
    { date: "2024-06-12", desktop: 492 },
    { date: "2024-06-13", desktop: 81 },
    { date: "2024-06-14", desktop: 426 },
    { date: "2024-06-15", desktop: 307 },
    { date: "2024-06-16", desktop: 371 },
    { date: "2024-06-17", desktop: 475 },
    { date: "2024-06-18", desktop: 107 },
    { date: "2024-06-19", desktop: 341 },
    { date: "2024-06-20", desktop: 408 },
    { date: "2024-06-21", desktop: 169 },
    { date: "2024-06-22", desktop: 317 },
    { date: "2024-06-23", desktop: 480 },
    { date: "2024-06-24", desktop: 132 },
    { date: "2024-06-25", desktop: 141 },
    { date: "2024-06-26", desktop: 434 },
    { date: "2024-06-27", desktop: 448 },
    { date: "2024-06-28", desktop: 149 },
    { date: "2024-06-29", desktop: 103 },
    { date: "2024-06-30", desktop: 446 },
]

const chartConfig = {
    views: {
        label: "Page Views",
    },
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function Component() {
    const [activeChart, setActiveChart] =
        useState<keyof typeof chartConfig>("desktop")

    const total = useMemo(
        () => ({
            desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
        }),
        []
    )

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Bar Chart - Interactive</CardTitle>
                    <CardDescription>
                        Showing total visitors for the last 3 months
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="views"
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }}
                                />
                            }
                        />
                        <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}


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
