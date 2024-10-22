import { useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatTime } from "../../src/utils/utils";
import { useTimerStore } from "../stores/settingStore";
import { defaults } from "../constants";

type Range = [start: number, end: number];

type TitleRanges = {
    title: string;
    range: Range;
};

type ActiveWindowDetails = {
    windowClass: string;
    titleRanges: TitleRanges[];
};

const Chart = () => {
    const divRef = useRef<HTMLDivElement | null>(null);

    const data: ActiveWindowDetails[] = [
        {
            windowClass: "Visual Studio Code",
            titleRanges: [
                { title: "Writing TypeScript", range: [0, 20] },
                { title: "Debugging JavaScript", range: [40, 50] },
                { title: "Code review", range: [70, 90] },
            ],
        },
        {
            windowClass: "Google Chrome",
            titleRanges: [
                { title: "Reading documentation", range: [20, 30] },
                { title: "Stack Overflow browsing", range: [30, 40] },
                { title: "Watching tutorial videos", range: [90, 120] },
            ],
        },
        {
            windowClass: "Slack",
            titleRanges: [
                { title: "Team chat", range: [120, 135] },
                { title: "Reviewing files", range: [135, 149] },
                { title: "Updating project status", range: [150, 160] },
            ],
        },
        {
            windowClass: "Spotify",
            titleRanges: [{ title: "Listening to Lo-fi playlist", range: [160, 180] }],
        },
        {
            windowClass: "Terminal",
            titleRanges: [
                { title: "Running Git commands", range: [180, 195] },
                { title: "NPM package installation", range: [195, 205] },
                { title: "Checking logs", range: [205, 210] },
            ],
        },
        {
            windowClass: "Figma",
            titleRanges: [
                { title: "Designing UI components", range: [210, 225] },
                { title: "Collaborating on wireframes", range: [225, 240] },
                { title: "Feedback session", range: [240, 260] },
            ],
        },
    ];

    return (
        <div className="w-screen">
            <div
                className="w-3/4  m-auto border border-gray-200 py-7 px-6 bg-white rounded-lg"
                ref={divRef}
            >
                <TimelineChart data={data} />
            </div>
        </div>
    );
};

function TimelineChart({ data }: { data: ActiveWindowDetails[] }) {
    const timelineRows = data.map(session => (
        <div className="flex items-center gap-5" key={session.windowClass}>
            <div className="w-28 truncate select-none text-sm font-500">{session.windowClass}</div>
            <TimelineRow titleRanges={session.titleRanges} />
        </div>
    ));

    return <div className="flex flex-col gap-4">{timelineRows}</div>;
}

function TimelineRow({ titleRanges }: { titleRanges: TitleRanges[] }) {
    // function to check timeBars : replace timeBars() with timeBarss
    // const timeBarss = titleRanges.map((subSession, index) => (
    //     <TimelineRangeBars
    //         previousRange={titleRanges[index - 1]?.range}
    //         currentRange={subSession.range}
    //         key={subSession.title}
    //     />
    // ));

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
    const calculateBarWidth = (range: Range) => {
        return (rangeDifference(range) / 260) * 100;
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

function TimelineBarWithToolTip({
    width,
    barDetails,
}: {
    width: number;
    barDetails: TitleRanges[];
}) {
    const getToolTipText = (barDetails: TitleRanges[]) => {
        return (
            <div className="space-y-2">
                {barDetails.map(({ title, range }) => (
                    <div key={title} className="flex justify-between gap-3 select-none">
                        <div className="text-sm text-gray-800">{title}</div>
                        <div className="text-sm">
                            {formatTime(range[0])} - {formatTime(range[1])}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger className="relative" style={{ width: `${width}%` }}>
                    <TimelineBar width={100} barStatus="active" />
                </TooltipTrigger>
                <TooltipContent className="p-3 bg-white shadow-none rounded-lg max-w-xs">
                    <div>{getToolTipText(barDetails)}</div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

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

export default Chart;
