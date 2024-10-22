import NumberFlow from "@number-flow/react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useTimerStore } from "../stores/settingStore";
import { Play, Pause, TimerReset } from "lucide-react";
import { defaults } from "../constants";
import { useEffect, useState } from "react";

function convertSeconds(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes, seconds };
}

export default function Timer() {
    const backgroundImagePath = useTimerStore(state => state.backgroundImagePath);
    const accentColor = useTimerStore(state => state.accentColor);

    const {
        sessionLengthInSeconds: sessionLength,
        breakLengthInSeconds: breakLength,
        numberOfSessions,
        timerStatus,
        setTimerStatus,
    } = useTimerStore();

    const [time, setTime] = useState(sessionLength);
    const [currentSession, setCurrentSession] = useState(1);
    const [completedAllSessions, setCompletedAllSessions] = useState(false);

    const handleReset = () => {
        setTimerStatus("idle");
        setTime(sessionLength);
        setCurrentSession(1);
        setCompletedAllSessions(false);
    };

    let iconColor = accentColor || defaults.accentColor;
    let { minutes, seconds } = convertSeconds(time);

    if (timerStatus === "running" && time <= 0) {
        if (currentSession > numberOfSessions) {
            setTimerStatus("completed");
            setCompletedAllSessions(true);
        } else {
            setTimerStatus("break");
            setTime(breakLength);
            setCurrentSession(done => done + 1);
        }
    }

    if (timerStatus === "break" && time <= 0) {
        setTimerStatus("running");
        setTime(sessionLength);
    }

    useEffect(() => {
        let id = null;

        if (timerStatus === "running" || timerStatus === "break") {
            id = setInterval(() => {
                setTime(time => time - 1);
            }, 1000);
        }

        return () => {
            id && clearInterval(id);
        };
    }, [timerStatus]);

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
                    format={{ notation: "compact" }}
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
                                onClick={() => setTimerStatus("running")}
                            />
                        ) : (
                            <Pause
                                className="h-4 w-4 cursor-pointer"
                                fill={iconColor}
                                stroke={iconColor}
                                onClick={() => setTimerStatus("paused")}
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
                            onClick={handleReset}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
