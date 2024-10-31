import NumberFlow from "@number-flow/react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useChartStore, useTimerStore } from "../stores/settingStore";
import { Play, Pause, TimerReset } from "lucide-react";
import { defaults } from "../constants";
import { memo, useEffect, useRef, useState } from "react";
import { convertSeconds } from "../utils/utils";
import { useWindowTitleStream } from "../hooks/useWindowTitleStream";
import { useShallow } from "zustand/react/shallow";
import { TitleRanges } from "./Chart";

type TimerStatus = "idle" | "running" | "paused" | "break" | "ended" | "completed";

const MemoizedTimer = memo(Timer);

function Timer({
    updateChart,
}: {
    updateChart: (activeWindowName: string, titleRanges: TitleRanges[]) => void;
}) {
    const backgroundImagePath = useTimerStore(state => state.backgroundImagePath);
    const accentColor = useTimerStore(state => state.accentColor);

    const { changeStreamStatus } = useWindowTitleStream();

    const { sessionLengthInSeconds, breakLengthInSeconds, numberOfSessions } = useTimerStore(
        useShallow(state => ({
            sessionLengthInSeconds: state.sessionLengthInSeconds,
            breakLengthInSeconds: state.breakLengthInSeconds,
            numberOfSessions: state.numberOfSessions,
        }))
    );

    const { activeWindow } = useWindowTitleStream();

    const [time, setTime] = useState(sessionLengthInSeconds);
    const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
    const [currentSession, setCurrentSession] = useState(0);
    const [completedAllSessions, setCompletedAllSessions] = useState(false);

    const windowNameChange = useRef({ currentTick: 0, previousTick: 0 });
    const windowNameRef = useRef({ currentWindow: "none", oldWindow: "none" });

    const titleChange = useRef({ currentTick: 0, previousTick: 0 });
    const titleRef = useRef({ currentWindow: "none", oldWindow: "none" });

    const titleRangesRef = useRef<TitleRanges[]>([]);

    const minimumActivityDuration = useChartStore(
        useShallow(state => state.minimumActivityDuration)
    );

    const handleReset = () => {
        setTimerStatus("idle");
        setTime(sessionLengthInSeconds);
        setCurrentSession(0);
        setCompletedAllSessions(false);
    };

    let iconColor = accentColor || defaults.accentColor;
    let { minutes, seconds } = convertSeconds(time);

    function handleSessionCompletion() {
        setTimerStatus("break");
        setTime(breakLengthInSeconds);
        setCurrentSession(done => done + 1);
    }

    function handlBreakCompletion() {
        if (currentSession === numberOfSessions) {
            setTimerStatus("completed");
            setCompletedAllSessions(true);
            changeStreamStatus("stopped");
        } else {
            setTimerStatus("running");
            setTime(sessionLengthInSeconds);
        }
    }

    // change time when user chagnes setting time, only in "idle" state
    useEffect(() => {
        if (timerStatus === "idle") {
            setTime(sessionLengthInSeconds);
        }
    }, [sessionLengthInSeconds, timerStatus]);

    useEffect(() => {
        let id = null;

        if (timerStatus === "running" || timerStatus === "break") {
            id = setInterval(() => {
                windowNameChange.current.currentTick += 1;
                titleChange.current.currentTick += 1;
                setTime(time => {
                    return time - 1;
                });
            }, 1000);
        }

        return () => {
            id && clearInterval(id);
        };
    }, [timerStatus]);

    useEffect(() => {
        if (time <= 0) {
            if (timerStatus === "running") {
                handleSessionCompletion();
            } else if (timerStatus === "break") {
                handlBreakCompletion();
            }
        }
    }, [timerStatus, time]);

    useEffect(() => {
        const ignoreTitles = ["Locus", "none"].includes(activeWindow.windowName);
        const isSameWindow = windowNameRef.current.currentWindow === activeWindow.windowName;
        const isGreaterThanThreshold =
            Math.abs(
                windowNameChange.current.currentTick - windowNameChange.current.previousTick
            ) >= minimumActivityDuration;
        const isTickDiff = titleChange.current.previousTick !== titleChange.current.currentTick;

        const flushTitleRanges = () => {
            // console.log(JSON.stringify(titleRangesRef.current));
            // console.log("flushed");
            windowNameChange.current.previousTick = windowNameChange.current.currentTick;
            titleRangesRef.current = [];
        };

        const addTitleRange = () => {
            const titleRangeForCurrentWindow = titleRangesRef.current;
            const lastRange = titleRangeForCurrentWindow.at(-1);

            if (
                titleRangeForCurrentWindow.length === 0 ||
                lastRange?.title !== activeWindow.title
            ) {
                titleRangeForCurrentWindow.push({
                    title: activeWindow.title,
                    range: [titleChange.current.currentTick - 1, titleChange.current.currentTick],
                });
            } else if (lastRange?.range[1] === titleChange.current.currentTick - 1) {
                lastRange.range[1] = titleChange.current.currentTick;
            }

            titleChange.current.previousTick = titleChange.current.currentTick;
        };

        const updateAndResetRanges = () => {
            updateChart(activeWindow.windowName, titleRangesRef.current);
            // console.log(JSON.stringify(titleRangesRef.current));
            // console.log("added");
            titleRangesRef.current = [];
        };

        if (timerStatus === "running" && isGreaterThanThreshold && isSameWindow && !ignoreTitles) {
            updateAndResetRanges();
        }

        if (!isSameWindow) {
            flushTitleRanges();
        }

        if (isTickDiff) {
            addTitleRange();
        }

        windowNameRef.current.currentWindow = activeWindow.windowName;
    }, [timerStatus, activeWindow, minimumActivityDuration, time]);
    // Intentionally includes time to trigger on time changes, will be removed when a better alternative is found

    return (
        <div className="font-bricolage-grotesque flex justify-center gap-4 w-screen">
            <div
                className="text-9xl tabular-nums text-white font-600 w-fit border rounded-lg px-8 relative group select-none"
                style={{
                    backgroundImage: backgroundImagePath
                        ? `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),url(${convertFileSrc(backgroundImagePath)})`
                        : `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),url(${defaults.backgroundImagePath})`,

                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                }}
            >
                <NumberFlow
                    value={minutes}
                    format={{ notation: "compact", minimumIntegerDigits: 2 }}
                    trend={"decreasing"}
                    className="[--number-flow-char-height:0.80em]"
                />
                :
                <NumberFlow
                    value={seconds}
                    format={{ notation: "compact", minimumIntegerDigits: 2 }}
                    trend={"decreasing"}
                    className="[--number-flow-char-height:0.80em]"
                />
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
                {timerStatus !== "completed" && (
                    <div>
                        {timerStatus === "idle" || timerStatus === "paused" ? (
                            <Play
                                className="h-4 w-4 cursor-pointer"
                                fill={iconColor}
                                stroke={iconColor}
                                onClick={() => {
                                    setTimerStatus("running");
                                    changeStreamStatus("streaming");
                                }}
                            />
                        ) : (
                            <Pause
                                className="h-4 w-4 cursor-pointer"
                                fill={iconColor}
                                stroke={iconColor}
                                onClick={() => {
                                    setTimerStatus("paused");
                                    changeStreamStatus("stopped");
                                }}
                            />
                        )}
                    </div>
                )}
                <div style={{ color: iconColor }} className="tabular-nums">
                    {currentSession}/{numberOfSessions}
                </div>
                {timerStatus !== "idle" && (
                    <div>
                        <TimerReset
                            className="h-4 w-4 cursor-pointer"
                            stroke={iconColor}
                            onClick={() => {
                                handleReset();
                                changeStreamStatus("stopped");
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default MemoizedTimer;
