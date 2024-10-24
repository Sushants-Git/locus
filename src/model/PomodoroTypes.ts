export class ActiveWindow {
    title: string;
    windowName: string;

    constructor(title: string, windowName: string) {
        this.title = title;
        this.windowName = windowName;
    }

    static none(): ActiveWindow {
        return new ActiveWindow("none", "none");
    }
}

