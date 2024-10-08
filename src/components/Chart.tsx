import { useRef, useEffect } from "react";
import useChatSizeStore from "../stores/chartSizeStore";

type SubSessionDetails = {
    title: string;
    range: [number, number];
};

type SessionDetails = {
    mainTitle: string;
    subTitleAndTime: SubSessionDetails[];
};

const Chart = () => {
    const divRef = useRef<HTMLDivElement | null>(null);
    const { changeSize } = useChatSizeStore();

    useEffect(() => {
        function handleResize() {
            if (divRef.current) {
                const { width, height } = divRef.current.getBoundingClientRect();
                changeSize(width, height);
            }
        }

        handleResize();

        window.addEventListener("resize", handleResize);
    }, []);

    const data: SessionDetails[] = [
        {
            mainTitle: "Visual Studio Code",
            subTitleAndTime: [
                { title: "Writing TypeScript", range: [0, 20] },
                { title: "Debugging JavaScript", range: [40, 50] },
                { title: "Code review", range: [70, 90] },
            ],
        },
        {
            mainTitle: "Google Chrome",
            subTitleAndTime: [
                { title: "Reading documentation", range: [20, 30] },
                { title: "Stack Overflow browsing", range: [30, 40] },
                { title: "Watching tutorial videos", range: [90, 120] },
            ],
        },
        {
            mainTitle: "Slack",
            subTitleAndTime: [
                { title: "Team chat", range: [120, 135] },
                { title: "Reviewing files", range: [135, 150] },
                { title: "Updating project status", range: [150, 160] },
            ],
        },
        {
            mainTitle: "Spotify",
            subTitleAndTime: [
                { title: "Listening to Lo-fi playlist", range: [160, 180] },
            ],
        },
        {
            mainTitle: "Terminal",
            subTitleAndTime: [
                { title: "Running Git commands", range: [180, 195] },
                { title: "NPM package installation", range: [195, 205] },
                { title: "Checking logs", range: [205, 210] },
            ],
        },
        {
            mainTitle: "Figma",
            subTitleAndTime: [
                { title: "Designing UI components", range: [210, 225] },
                { title: "Collaborating on wireframes", range: [225, 240] },
                { title: "Feedback session", range: [240, 260] },
            ],
        },
    ];

    return (
        <div className="border w-screen border-black">
            <div className="w-3/4 border border-red-400" ref={divRef}>
                <TimelineChart data={data} />
            </div>
        </div>
    );
};

function TimelineChart({ data }: { data: SessionDetails[] }) {
    const timelineRows = data.map((session) => (
        <TimelineRow data={session.subTitleAndTime} key={session.mainTitle} />
    ));

    return <div className="flex flex-col gap-3">{timelineRows}</div>;
}

function TimelineRow({ data }: { data: SubSessionDetails[] }) {
    // checker
    // const timeBarss = data.map((subSession, index) => (
    //     <TimelineRangeBars
    //         previousRange={data[index - 1]?.range}
    //         currentRange={subSession.range}
    //         key={subSession.title}
    //     />
    // ));

    const timeBars = () => {
        const timeBars = [];
        for (let i = 0; i < data.length; i++) {
            let previousRange = data[i - 1]?.range;
            let currentRange = data[i].range;

            // taking care of consecutive bar ranges : [10,20], [20,40], [40,60]
            // instead of creating 3 bars for the above we only create one : [10,60]

            for (let j = i; j < data.length; j++) {
                if (
                    data[j + 1]?.range[0] &&
                    data[j].range[1] !== data[j + 1].range[0]
                ) {
                    currentRange = [currentRange[0], data[j].range[1]];
                    i = j;
                    break;
                }

                if (data[j + 1]?.range[0] === undefined) {
                    currentRange = [currentRange[0], data[j].range[1]];
                    i = j;
                    break;
                }
            }

            timeBars.push(
                <TimelineRangeBars
                    previousRange={previousRange}
                    currentRange={currentRange}
                />,
            );
        }

        return timeBars;
    };

    return <div className="flex">{timeBars()}</div>;
}

function TimelineRangeBars({
    previousRange,
    currentRange,
}: {
    previousRange: [number, number] | undefined;
    currentRange: [number, number];
}) {
    const width = useChatSizeStore((state) => state.width);

    const calculateBarWidth = (range: [number, number]) => {
        return (rangeDifference(range) / 260) * width;
    };

    const rangeDifference = (range: [number, number]) => {
        return range[1] - range[0];
    };

    if (!previousRange && currentRange[0] === 0) {
        return (
            <TimelineBar width={calculateBarWidth(currentRange)} barStatus="active" />
        );
    }

    if (!previousRange) {
        return (
            <>
                <TimelineBar
                    width={calculateBarWidth([0, currentRange[0]])}
                    barStatus="inactive"
                />
                <TimelineBar
                    width={calculateBarWidth(currentRange)}
                    barStatus="active"
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
            <TimelineBar width={calculateBarWidth(currentRange)} barStatus="active" />
        </>
    );
}

function TimelineBar({
    width,
    barStatus,
}: {
    width: number;
    barStatus: "active" | "inactive";
}) {
    if (width === 0) {
        return null;
    }

    const backgroundColor = barStatus === "active" ? "black" : "white";
    return (
        <div style={{ width, backgroundColor }} className="h-6 rounded-md"></div>
    );
}

export default Chart;
