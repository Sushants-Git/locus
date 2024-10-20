import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import { open } from "@tauri-apps/plugin-dialog";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { appConfigDir } from "@tauri-apps/api/path";
import useTimerStore from "../../stores/timerStore";
import useAlertStore from "../../stores/alertStore";

interface TimerDialogProps {
    activeDialog: string;
    handleDialogChange: (isOpen: boolean) => void;
}

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpeg", "jpg", "gif", "svg", "webp", "bmp", "ico"];

const ImagePreview: React.FC<{ imagePath: string }> = ({ imagePath }) => (
    <div className="border relative rounded-sm">
        <img
            src={convertFileSrc(imagePath)}
            className="m-auto max-h-64"
            alt="Selected background"
        />
    </div>
);

const BackgroundImageSelector: React.FC<{
    onImageSelect: (path: string | null) => void;
    isDialogOpen: boolean;
    setIsDialogOpen: (isOpen: boolean) => void;
}> = ({ onImageSelect, isDialogOpen, setIsDialogOpen }) => {
    const handleImageSelect = async () => {
        if (isDialogOpen) return;

        setIsDialogOpen(true);
        try {
            const selected = await open({
                multiple: false,
                filters: [
                    {
                        name: "Image",
                        extensions: ALLOWED_IMAGE_EXTENSIONS,
                    },
                ],
            });

            if (selected) {
                onImageSelect(selected);
            }
        } finally {
            setIsDialogOpen(false);
        }
    };

    return (
        <div className="flex justify-between items-center gap-7">
            <div>
                <div>Background Image</div>
                <div className="text-sm text-muted-foreground">
                    Choose the background image used for the timer background
                </div>
            </div>
            <Button variant="outline" onClick={handleImageSelect}>
                Browse
            </Button>
        </div>
    );
};

export default function TimerDialog({ activeDialog, handleDialogChange }: TimerDialogProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageSelectDialogOpen, setIsImageSelectDialogOpen] = useState(false);

    const { showAlert } = useAlertStore();
    const changeBackgroundImagePath = useTimerStore(state => state.changeBackgroundImagePath);

    const handleSave = async () => {
        if (!selectedImage) {
            handleDialogChange(false);
            return;
        }

        try {
            const savedBackgroundImagePath: string = await invoke("save_file", {
                from: selectedImage,
                to: await appConfigDir(),
                targetFolder: "timer/background-images",
            });

            changeBackgroundImagePath(savedBackgroundImagePath);
            setSelectedImage(null);
        } catch (error) {
            showAlert({
                type: "error",
                title: "Unable to change background",
                message: (error as string) || "An unknown error occurred.",
            });
        }

        handleDialogChange(false);
    };

    return (
        <Dialog open={activeDialog === "timer"} onOpenChange={handleDialogChange}>
            <DialogContent className="w-3/5 min-w-[32rem] max-w-3/5">
                <DialogHeader>
                    <DialogTitle>Timer</DialogTitle>
                    <DialogDescription>Change timer settings</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <BackgroundImageSelector
                        onImageSelect={setSelectedImage}
                        isDialogOpen={isImageSelectDialogOpen}
                        setIsDialogOpen={setIsImageSelectDialogOpen}
                    />

                    {selectedImage && <ImagePreview imagePath={selectedImage} />}
                </div>

                <DialogFooter>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
