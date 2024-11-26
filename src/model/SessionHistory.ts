import { ActiveWindow } from "../model/PomodoroTypes";
import { v4 as uuidv4 } from "uuid";

export type Range = [start: number, end: number];

export type TitleRanges = {
    title: string;
    range: Range;
};

class SessionHistory {
    id: string;
    chartData: Map<string, TitleRanges[]> | null;
    pomodoroLengthInSeconds: number;
    breakLengthInSeconds: number; 
    sessionStartedOn: Date;

    constructor(
        pomodoroLengthInSeconds: number,
        breakLengthInSeconds: number,
        sessionStartedOn: Date,
        id: string = uuidv4(),
        chartData: Map<string, TitleRanges[]> | null = null,
    ) {
        this.id = id;
        this.chartData = chartData;
        this.pomodoroLengthInSeconds = pomodoroLengthInSeconds;
        this.sessionStartedOn = sessionStartedOn;
        this.breakLengthInSeconds = breakLengthInSeconds;
    }

    insertData(activeWindow: ActiveWindow, timeRangeInSeconds: Range) {
        const { windowName, title } = activeWindow;

        if (!this.chartData) {
            this.chartData = new Map<string, TitleRanges[]>();
        }

        const existingTitleRanges = this.chartData.get(windowName) || [];

        const lastEntry = existingTitleRanges.at(-1);
        if (
            lastEntry &&
            lastEntry.title === title &&
            lastEntry.range[1] === timeRangeInSeconds[0]
        ) {
            lastEntry.range[1] = timeRangeInSeconds[1];
        } else {
            existingTitleRanges.push({ title, range: timeRangeInSeconds });
        }

        this.chartData.set(windowName, existingTitleRanges);
    }
}

export { SessionHistory };
