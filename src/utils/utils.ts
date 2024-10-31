export const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours.toString()}:${mins.toString().padStart(2, "0")}`;
};

export function timeDiff(start: number, end: number) {
    const diff = Math.abs(start - end);

    if (diff < 60) {
        return `${diff} sec`;
    } else if (diff < 3600) {
        return `${(diff / 60).toFixed(1)} min`;
    } else {
        return `${(diff / 3600).toFixed(1)} h`;
    }
}

export function convertSeconds(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes, seconds };
}
