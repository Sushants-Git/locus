import NumberFlow from "@number-flow/react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useChartStore, useTimerStore } from "../stores/settingStore";
import { Play, Pause, TimerReset, Coffee, BookText, Shell } from "lucide-react";
import { defaults } from "../constants";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { convertSeconds } from "../utils/utils";
import { useWindowTitleStream } from "../hooks/useWindowTitleStream";
import { useShallow } from "zustand/react/shallow";
import { TitleRanges } from "src/model/SessionHistory";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TimerStatus = "idle" | "running" | "paused" | "break" | "ended" | "completed";

const MemoizedTimer = memo(Timer);

function Timer({
    updateChart,
    adjustChart,
    resetChart,
}: {
    updateChart: (activeWindowName: string, titleRanges: TitleRanges[]) => void;
    adjustChart: (totalPomodoro: number, totalBreak: number) => void;
    resetChart: () => void;
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

    if (completedAllSessions) {
        // TODO: reminder to add a message on session completion
    }

    const windowNameChange = useRef({ currentTick: 0, previousTick: 0 });
    const windowNameRef = useRef({ currentWindow: "none", oldWindow: "none" });
    const titleChange = useRef({ currentTick: 0, previousTick: 0 });
    const titleRangesRef = useRef<TitleRanges[]>([]);

    const timerStatusRef = useRef({ previousTimerStatus: "idle" });

    const minimumActivityDuration = useChartStore(
        useShallow(state => state.minimumActivityDuration)
    );

    const resetRef = () => {
        windowNameChange.current = { currentTick: 0, previousTick: 0 };
        windowNameRef.current = { currentWindow: "none", oldWindow: "none" };
        titleChange.current = { currentTick: 0, previousTick: 0 };
        titleRangesRef.current = [];
    };

    const handleReset = () => {
        setTime(sessionLengthInSeconds);
        setTimerStatus("idle");
        setCurrentSession(0);
        setCompletedAllSessions(false);

        resetChart();
        resetRef();
        changeStreamStatus("stopped");
    };

    let iconColor = accentColor || defaults.accentColor;
    let { minutes, seconds } = convertSeconds(time);

    const handleSessionCompletion = useCallback(() => {
        setTimerStatus("break");
        setTime(breakLengthInSeconds);
        setCurrentSession(done => done + 1);
    }, [breakLengthInSeconds]);

    const handlBreakCompletion = useCallback(() => {
        if (currentSession === numberOfSessions) {
            setTimerStatus("completed");
            setCompletedAllSessions(true);
            changeStreamStatus("stopped");
        } else {
            setTimerStatus("running");
            setTime(sessionLengthInSeconds);
        }
    }, [currentSession, numberOfSessions, sessionLengthInSeconds, changeStreamStatus]);

    // change time when user chagnes setting time, only in "idle" state
    useEffect(() => {
        if (timerStatus === "idle") {
            setTime(sessionLengthInSeconds);
        }
    }, [sessionLengthInSeconds, timerStatus]);

    useEffect(() => {
        const totalPomodoro =
            sessionLengthInSeconds * numberOfSessions + breakLengthInSeconds * numberOfSessions;
        const totalBreak = breakLengthInSeconds * numberOfSessions;

        adjustChart(totalPomodoro, totalBreak);
    }, [sessionLengthInSeconds, breakLengthInSeconds, numberOfSessions, adjustChart]);

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
    }, [timerStatus, time, handleSessionCompletion, handlBreakCompletion]);

    useEffect(() => {
        const ignoreTitles = ["none"].includes(activeWindow.windowName);
        const isSameWindow = windowNameRef.current.currentWindow === activeWindow.windowName;
        const isGreaterThanThreshold =
            Math.abs(
                windowNameChange.current.currentTick - windowNameChange.current.previousTick
            ) >= minimumActivityDuration;
        const isTickDiff = titleChange.current.previousTick !== titleChange.current.currentTick;

        const flushTitleRanges = () => {
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
            titleRangesRef.current = [];
        };

        // when we shift from running to break we want to flush the "titleRangesRef"
        if (!isSameWindow || timerStatus === "break") {
            flushTitleRanges();
        }

        if (isTickDiff) {
            if (timerStatusRef.current.previousTimerStatus !== "break") {
                addTitleRange();
            }

            if (
                timerStatus === "running" &&
                isGreaterThanThreshold &&
                isSameWindow &&
                !ignoreTitles
            ) {
                updateAndResetRanges();
            }

            if (timerStatus === "running") {
                timerStatusRef.current.previousTimerStatus = "running";
            }

            if (
                timerStatusRef.current.previousTimerStatus === "running" &&
                timerStatus === "break"
            ) {
                timerStatusRef.current.previousTimerStatus = "break";
            }
        } // effect gets triggered on activeWindow, `isTickDiff` makes sure that it does not `addTitleRange` on the same second

        windowNameRef.current.currentWindow = activeWindow.windowName;
    }, [timerStatus, activeWindow, minimumActivityDuration, time]);
    // Intentionally includes "time" to trigger when "time" changes, will be removed when a better alternative is found

    return (
        <div className="font-bricolage-grotesque flex justify-center gap-4 w-screen">
            <div className="flex flex-col justify-end">
                {timerStatus === "running" ||
                timerStatus === "break" ||
                timerStatus === "paused" ||
                timerStatus === "idle" ? (
                    <PomodoroIndicator timerStatus={timerStatus} fill={iconColor} />
                ) : null}
            </div>
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
                            onClick={handleReset}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

const PomodoroIndicator = ({ timerStatus, fill }: { timerStatus: TimerStatus; fill: string }) => {
    const [lastActiveState, setLastActiveState] = useState(timerStatus);

    useEffect(() => {
        if (timerStatus === "running" || timerStatus === "break") {
            setLastActiveState(timerStatus);
        }
    }, [timerStatus]);

    if (timerStatus === "idle") {
        return (
            <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div style={{ color: fill }} className="cursor-pointer">
                            <Shell className="h-5 w-5" strokeWidth={1} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                        <p>no active session</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    const emoji =
        lastActiveState === "break" ? (
            <Coffee className="h-5 w-5" strokeWidth={1} />
        ) : (
            <BookText className="h-5 w-5" strokeWidth={1} />
        );

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div style={{ color: fill }} className="cursor-pointer">
                        {emoji}
                    </div>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                    <p>{lastActiveState === "running" ? "focus time" : "break time"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default MemoizedTimer;
