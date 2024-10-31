import { ActiveWindow } from "../model/PomodoroTypes";
import { v4 as uuidv4 } from "uuid";

export type Range = [start: number, end: number];

type TitleRanges = {
    title: string;
    range: Range;
};

class SessionHistory {
    id: string;
    chartData: Map<string, TitleRanges[]> | null;
    pomodoroLengthInSeconds: number;
    sessionStartedOn: Date;

    constructor(pomodoroLengthInSeconds: number, sessionStartedOn: Date, id: string = uuidv4()) {
        this.id = id;
        this.chartData = null;
        this.pomodoroLengthInSeconds = pomodoroLengthInSeconds;
        this.sessionStartedOn = sessionStartedOn;
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
