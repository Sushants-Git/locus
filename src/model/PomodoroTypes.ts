export class ActiveWindow {
    title: string;
    class: string;

    constructor(title: string, className: string) {
        this.title = title;
        this.class = className;
    }

    static none(): ActiveWindow {
        return new ActiveWindow("none", "none");
    }
}

