import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BarChart2, Calendar, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { SessionHistory, TitleRanges } from "src/model/SessionHistory";

import { format } from "date-fns";

import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { BarRectangleItem } from "recharts/types/cartesian/Bar";


export const PerformanceGraphs = ({
    children,
    activeChart,
    open,
    setOpen,
}: {
    children: React.ReactNode;
    activeChart: Omit<SessionHistory, "chartData"> & {
        chartData: Map<string, TitleRanges[]>;
    };
    open: boolean;
    setOpen: (open: boolean) => void;
}) => {
    if (!open) {
        return children;
    }

    const [selectedBar, setSelectedBar] = useState(() => {
        let mapToArray = Array.from(activeChart.chartData);

        let firstWindowClass = mapToArray.at(0);

        if (!firstWindowClass) return null;

        return firstWindowClass[0];
    });

    const [selectedBarFill, setSelectedBarFill] = useState("hsl(var(--chart-1))");
    // the colors are assigned in order in MainBarGraph and hence we can do this assigment

    const handleBarClick = (e: BarRectangleItem) => {
        if (e.fill) {
            setSelectedBarFill(e.fill);
        }
        setSelectedBar((e as { windowClass: string }).windowClass || null);
    };

    const secondaryChartMap: Map<string, number> = new Map();

    if (selectedBar) {
        activeChart.chartData.get(selectedBar)?.forEach(({ title, range }) => {
            let time = secondaryChartMap.get(title);
            let timeDiff = Math.abs(range[0] - range[1]);

            if (time) {
                secondaryChartMap.set(title, timeDiff + time);
            } else {
                secondaryChartMap.set(title, timeDiff);
            }
        });
    }

    const secondaryChartData: { title: string; time: number }[] = [];

    Array.from(secondaryChartMap).forEach(([title, time]) => {
        if (time > 60) {
            secondaryChartData.push({ title, time: Math.round((time / 60) * 10) / 10 });
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="w-3/5 min-w-[32rem] max-w-3/5">
                <DialogHeader>
                    <DialogTitle>Activity Detail</DialogTitle>
                    <DialogDescription>
                        Show you where and what you spent your time doing.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[32rem] w-full rounded-md border">
                    <div className="p-4">
                        <div className="grid gap-4 md:grid-cols-5">
                            <div className="md:grid gap-4 md:grid-cols-subgrid md:col-span-5">
                                <div className="mb-4 md:mb-0 md:col-span-2">
                                    <GraphDetails activeChart={activeChart} />
                                </div>
                                <MainBarGraph
                                    data={activeChart.chartData}
                                    handleBarClick={handleBarClick}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-subgrid md:col-span-5">
                                <SecondaryBarGraph
                                    className="md:col-span-5"
                                    data={secondaryChartData}
                                    fill={selectedBarFill}
                                />
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export function GraphDetails({
    activeChart,
}: {
    activeChart: Omit<SessionHistory, "chartData"> & {
        chartData: Map<string, TitleRanges[]>;
    };
}) {
    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    const { totalTimeSpentWorking, activityBreakdown } = useMemo(() => {
        let total = 0;
        const breakdown: { windowClass: string; time: number }[] = [];

        Array.from(activeChart.chartData).forEach(([windowClass, titleRanges]) => {
            let classTotal = 0;
            titleRanges.forEach(titleRange => {
                const duration = Math.abs(titleRange.range[1] - titleRange.range[0]);
                total += duration;
                classTotal += duration;
            });
            breakdown.push({ windowClass, time: classTotal });
        });

        return {
            totalTimeSpentWorking: total,
            activityBreakdown: breakdown.sort((a, b) => b.time - a.time),
        };
    }, [activeChart.chartData]);

    const productivityPercentage =
        (totalTimeSpentWorking / activeChart.pomodoroLengthInSeconds) * 100;

    return (
        <Card className="w-full h-full pt-6">
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" strokeWidth={1} />
                        <span className="text-sm font-medium">
                            {format(activeChart.sessionStartedOn, "MMM d")}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" strokeWidth={1} />
                        <span className="text-sm font-medium">
                            {formatDuration(
                                activeChart.pomodoroLengthInSeconds -
                                    activeChart.breakLengthInSeconds
                            )}
                        </span>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Productivity</span>
                        <span className="text-sm text-muted-foreground">
                            {formatDuration(totalTimeSpentWorking)} (
                            {productivityPercentage.toFixed(1)}%)
                        </span>
                    </div>
                    <Progress value={productivityPercentage} className="h-2" />
                </div>
                <Separator />
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <BarChart2 className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">Activity Breakdown</span>
                    </div>
                    <ScrollArea
                        className="flex max-h-24 flex-col overflow-y-auto w-full rounded-md border p-3"
                        onScroll={e => e.stopPropagation()}
                    >
                        {activityBreakdown.map(({ windowClass, time }, index) => (
                            <div key={index} className="flex justify-between items-center py-2">
                                <span className="text-sm truncate max-w-[70%]">{windowClass}</span>
                                <span className="text-sm text-muted-foreground">
                                    {formatDuration(time)}
                                </span>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}

export function MainBarGraph({
    data,
    handleBarClick,
    className,
}: {
    data: Map<string, TitleRanges[]>;
    handleBarClick: (e: BarRectangleItem) => void;
    className: string;
}) {
    const chartData: { windowClass: string; totalTime: number; fill: string }[] = [];
    const chartConfig: ChartConfig = { totalTime: { label: "time (min)" } };

    Array.from(data).forEach(([windowClass, titleRanges], index) => {
        let totalTime = 0;
        titleRanges.forEach(a => (totalTime = totalTime + (a.range[1] - a.range[0])));
        if (totalTime > 60) {
            chartData.push({
                windowClass,
                totalTime: Math.round((totalTime * 10) / 60) / 10,
                fill: `hsl(var(--chart-${index + 1}))`,
            });
        }

        chartConfig[windowClass] = { label: windowClass };
    });

    return (
        <Card className={`${className} w-full`}>
            <CardContent className="flex items-center h-full">
                <ChartContainer config={chartConfig} className="w-full mt-8">
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="windowClass"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={value => {
                                // Create a Github Issue for this at shadcn/ui
                                return chartConfig[value as keyof typeof chartConfig]
                                    ?.label as string;
                            }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar
                            dataKey="totalTime"
                            strokeWidth={2}
                            radius={8}
                            activeIndex={2}
                            onClick={e => e && handleBarClick(e)}
                            className="cursor-pointer"
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export function SecondaryBarGraph({
    className,
    fill,
    data,
}: {
    className: string;
    fill: string;
    data: { time: number; title: string }[];
}) {
    const chartConfig = {
        time: {
            label: "time (min)",
        },
        title: {
            label: "title",
        },
    } satisfies ChartConfig;

    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("time");

    return (
        <Card className={className}>
            <CardHeader className="flex flex-col items-stretch space-y-0 p-0 sm:flex-row"></CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="title"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            hide
                            tickFormatter={value => {
                                return value;
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="time"
                                    labelFormatter={value => {
                                        return (
                                            <div className="truncate max-w-[100px]">{value}</div>
                                        );
                                    }}
                                />
                            }
                        />
                        <Bar dataKey={activeChart} fill={fill} radius={3} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
