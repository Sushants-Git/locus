import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useChartStore } from "../../stores/settingStore";
import { useState } from "react";

interface TimerDialogProps {
    activeDialog: string;
    handleDialogChange: (isOpen: boolean) => void;
}

export default function ChartDialog({ activeDialog, handleDialogChange }: TimerDialogProps) {
    const minimumActivityDuration = useChartStore(state => state.minimumActivityDuration);
    const setMinimumActivityDuration = useChartStore(state => state.setMinimumActivityDuration);

    const [activityDuration, setActivityDuration] = useState(minimumActivityDuration);

    const handleSave = async () => {
        setMinimumActivityDuration(activityDuration);
        handleDialogChange(false);
    };

    return (
        <Dialog open={activeDialog === "chart"} onOpenChange={handleDialogChange}>
            <DialogContent className="w-3/5 min-w-[32rem] max-w-3/5">
                <DialogHeader>
                    <DialogTitle>Chart</DialogTitle>
                    <DialogDescription>Change chart settings</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[32rem]">
                    <div className="flex flex-col gap-7 pr-5">
                        <Separator />
                        <div className="flex items-center justify-between gap-5 w-full">
                            <div>
                                <div>Minimum Activity Duration</div>
                                <div className="text-sm text-muted-foreground">
                                    Don't show activities shorter than this threshold{" "}
                                </div>
                            </div>
                            <div className="w-3/6">
                                <Slider
                                    value={[activityDuration]}
                                    min={1}
                                    max={180}
                                    step={1}
                                    onValueChange={e => setActivityDuration(e[0])}
                                />
                            </div>
                        </div>
                        <Separator />
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
