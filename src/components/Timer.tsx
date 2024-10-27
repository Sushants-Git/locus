import NumberFlow from "@number-flow/react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useTimerStore } from "../stores/settingStore";
import { Play, Pause, TimerReset } from "lucide-react";
import { defaults } from "../constants";
import { useEffect, useRef, useState } from "react";
import { convertSeconds } from "../utils/utils";
import { useWindowTitleStream } from "../hooks/useWindowTitleStream";
import { useShallow } from "zustand/react/shallow";

type TimerStatus = "idle" | "running" | "paused" | "break" | "ended" | "completed";

export default function Timer() {
    const backgroundImagePath = useTimerStore(state => state.backgroundImagePath);
    const accentColor = useTimerStore(state => state.accentColor);

    const { changeStreamStatus } = useWindowTitleStream();

    const { sessionLengthInSeconds, breakLengthInSeconds, numberOfSessions } = useTimerStore(
        useShallow(state => ({
            sessionLengthInSeconds: state.sessionLengthInSeconds,
            breakLengthInSeconds: state.breakLengthInSeconds,
            numberOfSessions: state.numberOfSessions,
            // setTimerStatus: state.setTimerStatus,
        }))
    );

    // const timerStatus = useTimerStore(state => state.timerStatus);

    const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");

    const [time, setTime] = useState(sessionLengthInSeconds);
    const [currentSession, setCurrentSession] = useState(1);
    const [completedAllSessions, setCompletedAllSessions] = useState(false);

    const handleReset = () => {
        setTimerStatus("idle");
        setTime(sessionLengthInSeconds);
        setCurrentSession(1);
        setCompletedAllSessions(false);
    };

    let iconColor = accentColor || defaults.accentColor;
    let { minutes, seconds } = convertSeconds(time);

    function handleSessionCompletion() {
        if (currentSession > numberOfSessions) {
            setTimerStatus("completed");
            setCompletedAllSessions(true);
            changeStreamStatus("stopped");
        } else {
            setTimerStatus("break");
            setTime(breakLengthInSeconds);
            setCurrentSession(done => done + 1);
        }
    }

    function handlBreakCompletion() {
        setTimerStatus("running");
        setTime(sessionLengthInSeconds);
    }

    useEffect(() => {
        if (timerStatus === "idle") {
            setTime(sessionLengthInSeconds);
        }
    }, [sessionLengthInSeconds]);

    useEffect(() => {
        let id = null;

        if (timerStatus === "running" || timerStatus === "break") {
            id = setInterval(() => {
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

    return (
        <div className="font-bricolage-grotesque mb-5 mt-5 flex justify-center gap-4">
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
                    isolate
                    className="[--number-flow-char-height:0.80em]"
                />
                :
                <NumberFlow
                    value={seconds}
                    format={{ notation: "compact", minimumIntegerDigits: 2 }}
                    isolate
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
                <div style={{ color: iconColor }}>
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
