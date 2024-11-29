import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { BarChart2, Calendar, Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { SessionHistory, TitleRanges } from "src/model/SessionHistory";
import { Slider } from "@/components/ui/slider";

interface PerformanceGraphsProps {
    children: React.ReactNode;
    activeChart: Omit<SessionHistory, "chartData"> & {
        chartData: Map<string, TitleRanges[]>;
    };
    open: boolean;
    setOpen: (open: boolean) => void;
}

interface ChartData {
    windowClass: string;
    totalTime: number;
    fill: string;
}

interface SecondaryChartData {
    title: string;
    time: number;
}

export const PerformanceGraphs: React.FC<PerformanceGraphsProps> = ({
    children,
    activeChart,
    open,
    setOpen,
}) => {
    const [selectedBar, setSelectedBar] = useState<string | null>(() => {
        const mapToArray = Array.from(activeChart.chartData);
        return mapToArray[0]?.[0] ?? null;
    });

    const [selectedBarFill, setSelectedBarFill] = useState("hsl(var(--chart-1))");

    const [filterGraphsBelow, setFilterGraphsBelow] = useState(15);

    const secondaryChartData = useMemo(() => {
        if (!selectedBar) return [];

        const secondaryChartMap = new Map<string, number>();
        activeChart.chartData.get(selectedBar)?.forEach(({ title, range }) => {
            const timeDiff = Math.abs(range[0] - range[1]);
            secondaryChartMap.set(title, (secondaryChartMap.get(title) || 0) + timeDiff);
        });

        return Array.from(secondaryChartMap)
            .filter(([_, time]) => time > filterGraphsBelow)
            .map(([title, time]) => ({
                title,
                time: Math.round((time / 60) * 10) / 10,
            }));
    }, [activeChart, selectedBar, filterGraphsBelow]);

    const handleBarClick = (e: any) => {
        if (e.fill) setSelectedBarFill(e.fill);
        setSelectedBar(e.windowClass || null);
    };

    if (!open) return children;

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
                <ScrollArea className="max-h-[32rem] w-full rounded-md border">
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
                                <div className="w-full md:col-span-5">
                                    <div className="flex w-[80%] gap-5 mb-4 justify-center items-center">
                                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                                            minimun duration
                                        </div>
                                        <Slider
                                            value={[filterGraphsBelow]}
                                            min={1}
                                            max={120}
                                            step={1}
                                            onValueChange={e => setFilterGraphsBelow(e[0])}
                                        />
                                    </div>

                                    <SecondaryBarGraph
                                        data={secondaryChartData}
                                        fill={selectedBarFill}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

interface GraphDetailsProps {
    activeChart: PerformanceGraphsProps["activeChart"];
}

function GraphDetails({ activeChart }: GraphDetailsProps) {
    const { totalTimeSpentWorking, activityBreakdown } = useMemo(() => {
        let total = 0;
        const breakdown: { windowClass: string; time: number }[] = [];

        Array.from(activeChart.chartData).forEach(([windowClass, titleRanges]) => {
            const classTotal = titleRanges.reduce((acc, titleRange) => {
                const duration = Math.abs(titleRange.range[1] - titleRange.range[0]);
                total += duration;
                return acc + duration;
            }, 0);

            breakdown.push({ windowClass, time: classTotal });
        });

        return {
            totalTimeSpentWorking: total,
            activityBreakdown: breakdown.sort((a, b) => b.time - a.time),
        };
    }, [activeChart.chartData]);

    const productivityPercentage =
        (totalTimeSpentWorking /
            (activeChart.pomodoroLengthInSeconds - activeChart.breakLengthInSeconds)) *
        100;

    return (
        <Card className="w-full h-full pt-6">
            <CardContent className="space-y-4">
                <SessionHeader
                    sessionDate={activeChart.sessionStartedOn}
                    workDuration={
                        activeChart.pomodoroLengthInSeconds - activeChart.breakLengthInSeconds
                    }
                />
                <ProductivityProgress
                    totalTimeSpentWorking={totalTimeSpentWorking}
                    productivityPercentage={productivityPercentage}
                />
                <Separator />
                <ActivityBreakdown activityBreakdown={activityBreakdown} />
            </CardContent>
        </Card>
    );
}

function SessionHeader({ sessionDate, workDuration }: { sessionDate: Date; workDuration: number }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" strokeWidth={1} />
                <span className="text-sm font-medium">{format(sessionDate, "MMM d")}</span>
            </div>
            <div className="flex gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" strokeWidth={1} />
                <span className="text-sm font-medium">{formatDuration(workDuration)}</span>
            </div>
        </div>
    );
}

function ProductivityProgress({
    totalTimeSpentWorking,
    productivityPercentage,
}: {
    totalTimeSpentWorking: number;
    productivityPercentage: number;
}) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Productivity</span>
                <span className="text-sm text-muted-foreground">
                    {formatDuration(totalTimeSpentWorking)} ({productivityPercentage.toFixed(1)}%)
                </span>
            </div>
            <Progress value={productivityPercentage} className="h-2" />
        </div>
    );
}

function ActivityBreakdown({
    activityBreakdown,
}: {
    activityBreakdown: { windowClass: string; time: number }[];
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center space-x-2">
                <BarChart2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Activity Breakdown</span>
            </div>
            <ScrollArea className="flex max-h-24 flex-col overflow-y-auto w-full rounded-md border">
                <div className="p-3">
                    {activityBreakdown.map(({ windowClass, time }, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                            <span className="text-sm truncate max-w-[70%]">{windowClass}</span>
                            <span className="text-sm text-muted-foreground">
                                {formatDuration(time)}
                            </span>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

function MainBarGraph({
    data,
    handleBarClick,
    className,
}: {
    data: Map<string, TitleRanges[]>;
    handleBarClick: (e: any) => void;
    className: string;
}) {
    const chartData: ChartData[] = [];
    const chartConfig: ChartConfig = { totalTime: { label: "time (min)" } };

    Array.from(data).forEach(([windowClass, titleRanges], index) => {
        const totalTime = titleRanges.reduce((acc, a) => acc + (a.range[1] - a.range[0]), 0);

        chartData.push({
            windowClass,
            totalTime: Math.round((totalTime * 10) / 60) / 10,
            fill: `hsl(var(--chart-${index + 1}))`,
        });

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
                            tickFormatter={value =>
                                chartConfig[value as keyof typeof chartConfig]?.label ?? value
                            }
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

function SecondaryBarGraph({
    className,
    fill,
    data,
}: {
    className?: string;
    fill: string;
    data: SecondaryChartData[];
}) {
    const chartConfig = {
        time: { label: "time (min)" },
        title: { label: "title" },
    } satisfies ChartConfig;

    return (
        <Card className={className}>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <BarChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="title"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            hide
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="time"
                                    labelFormatter={value => (
                                        <div className="truncate max-w-[100px]">{value}</div>
                                    )}
                                />
                            }
                        />
                        <Bar dataKey="time" fill={fill} radius={3} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default PerformanceGraphs;
