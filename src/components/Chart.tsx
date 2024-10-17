import { useRef } from "react";

type Range = [start: number, end: number];

type SubSessionDetails = {
    title: string;
    range: Range;
};

type SessionDetails = {
    windowClass: string;
    titleRanges: SubSessionDetails[];
};

const Chart = () => {
    const divRef = useRef<HTMLDivElement | null>(null);

    const data: SessionDetails[] = [
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

    console.log("humm");

    return (
        <div className="border w-screen border-black">
            <div className="w-3/4 border border-red-400" ref={divRef}>
                <TimelineChart data={data} />
            </div>
        </div>
    );
};

function TimelineChart({ data }: { data: SessionDetails[] }) {
    const timelineRows = data.map(session => (
        <div className="flex items-center" key={session.windowClass}>
            <div className="w-44 text-lg">{session.windowClass}</div>
            <TimelineRow data={session.titleRanges} />
        </div>
    ));

    return (
        <div className="flex flex-col gap-3">{timelineRows}</div>
    );
}

function TimelineRow({ data }: { data: SubSessionDetails[] }) {
    // function to check timeBars : replace timeBars() with timeBarss
    // const timeBarss = data.map((subSession, index) => (
    //     <TimelineRangeBars
    //         previousRange={data[index - 1]?.range}
    //         currentRange={subSession.range}
    //         key={subSession.title}
    //     />
    // ));

    const timeBars = () => {
        const timeBars = [];
        let i = 0;

        while (i < data.length) {
            let currentRange: Range = [...data[i].range];
            const previousRange = i > 0 ? data[i - 1].range : null;

            // Merge consecutive ranges if they are contiguous
            // [10,20], [20,40], [40,60] -> [10,60]
            while (i + 1 < data.length && data[i].range[1] === data[i + 1].range[0]) {
                currentRange[1] = data[i + 1].range[1];
                i++;
            }

            timeBars.push(
                <TimelineRangeBars
                    key={i}
                    previousRange={previousRange}
                    currentRange={currentRange}
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
}: {
    previousRange: Range | null;
    currentRange: Range;
}) {
    const calculateBarWidth = (range: Range) => {
        return (((rangeDifference(range) / 260))) * 100;
    };

    // Example ranges: [10, 50], [50, 60], [80, 120]
    // Total study session duration: 120 minutes
    //
    // For the range [10, 50]:
    // 1. Duration: (50 - 10) = 40 minutes
    // 2. Width percentage = (duration / totalDuration) * 100
    //    - Example: (40 / 120) * 100 = 33.33%
    // 
    // This percentage determines the bar's width relative to the total chart area width.

    const rangeDifference = (range: Range) => {
        return range[1] - range[0];
    };

    if (!previousRange && currentRange[0] === 0) {
        return <TimelineBar width={calculateBarWidth(currentRange)} barStatus="active" />;
    }

    if (!previousRange) {
        return (
            <>
                <TimelineBar width={calculateBarWidth([0, currentRange[0]])} barStatus="inactive" />
                <TimelineBar width={calculateBarWidth(currentRange)} barStatus="active" />
            </>
        );
    }

    return (
        <>
            <TimelineBar
                width={calculateBarWidth([previousRange[1], currentRange[0]])}
                barStatus="inactive"
            />
            <TimelineBar width={calculateBarWidth(currentRange)} barStatus="active" />
        </>
    );
}

function TimelineBar({ width, barStatus }: { width: number; barStatus: "active" | "inactive" }) {
    if (width === 0) {
        return null;
    }

    const backgroundColor = barStatus === "active" ? "black" : "white";
    return <div style={{ width: `${width}%`, backgroundColor }} className="h-8 rounded-md"></div>;
}

export default Chart;
