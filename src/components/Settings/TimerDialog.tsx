import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

import { open } from "@tauri-apps/plugin-dialog";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { appConfigDir } from "@tauri-apps/api/path";
import { useTimerStore } from "../../stores/settingStore";
import useAlertStore from "../../stores/alertStore";

// @ts-ignore
import ColorThief from "colorthief";

import { convertSeconds } from "../../utils/utils";
import ImagePreview from "./ImagePreview";

type RGB = [number, number, number];

interface TimerDialogProps {
    activeDialog: string;
    handleDialogChange: (isOpen: boolean) => void;
}

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpeg", "jpg", "gif", "svg", "webp", "bmp", "ico"];

const getColorPalette = (imagePath: string): Promise<RGB[]> => {
    try {
        return new Promise((resolve, _) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = convertFileSrc(imagePath);

            const handleImage = () => {
                const colorThief = new ColorThief();
                return colorThief.getPalette(img);
            };

            if (img.complete) {
                resolve(handleImage());
            } else {
                img.addEventListener("load", () => resolve(handleImage()));
            }
        });
    } catch (error) {
        throw new Error(`Failed to extract color palette: ${error}`);
    }
};

const BackgroundImageSelector: React.FC<{
    onImageSelect: (path: string | null) => void;
    isImageSelectDialogOpen: boolean;
    setIsDialogOpen: (isOpen: boolean) => void;
}> = ({ onImageSelect, isImageSelectDialogOpen, setIsDialogOpen }) => {
    const handleImageSelect = async () => {
        if (isImageSelectDialogOpen) return;

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

function ColorPalette({
    colors,
    onColorSelect,
}: {
    colors: RGB[];
    onColorSelect: (color: string) => void;
}) {
    const rgbToHex = (r: number, g: number, b: number) =>
        "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");

    return (
        <div className="flex flex-col gap-4">
            <div>
                <div>Choose accent color</div>
                <div className="text-sm text-muted-foreground">
                    Accent colors are used for custom styling some components (eg. bars on the
                    timeline chart)
                </div>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg shadow-sm inline-block">
                <div className="flex flex-wrap justify-center gap-2">
                    {colors.map((color, index) => {
                        const hexColor = rgbToHex(...color);
                        return (
                            <button
                                key={index}
                                className="w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform"
                                style={{ backgroundColor: hexColor }}
                                onClick={() => onColorSelect(rgbToHex(...color))}
                                aria-label={`Select color ${hexColor}`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function TimeValueSelectors({
    timeValues,
    updateTimeValues,
}: {
    timeValues: TimeValues;
    updateTimeValues: (updates: Partial<TimeValues>) => void;
}) {
    const { sessionLength, breakLength, numberOfSessions } = timeValues;

    return (
        <div className="flex justify-between items-center">
            <div>
                <div>Pomodoro Settings</div>
                <div className="text-sm text-muted-foreground">Customize your sessions</div>
            </div>
            <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-2">
                    <Label htmlFor="sessionLength">Session Length (minutes)</Label>
                    <Input
                        id="sessionLength"
                        type="number"
                        value={sessionLength}
                        min={1}
                        onChange={e => {
                            if (Number.isInteger(e.target.valueAsNumber)) {
                                updateTimeValues({ sessionLength: e.target.valueAsNumber });
                            }
                        }}
                    />
                </div>
                <div className="grid w-full items-center gap-2">
                    <Label htmlFor="breakLength">Break Length (minutes)</Label>
                    <Input
                        id="breakLength"
                        type="number"
                        value={breakLength}
                        min={0}
                        onChange={e => {
                            if (Number.isInteger(e.target.valueAsNumber)) {
                                updateTimeValues({ breakLength: e.target.valueAsNumber });
                            }
                        }}
                    />
                </div>
                <div className="grid w-full items-center gap-2">
                    <Label htmlFor="numberOfSessions">Number of Sessions</Label>
                    <Input
                        id="numberOfSessions"
                        type="number"
                        value={numberOfSessions}
                        min={1}
                        onChange={e => {
                            if (Number.isInteger(e.target.valueAsNumber)) {
                                updateTimeValues({ numberOfSessions: e.target.valueAsNumber });
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

interface ImageSettings {
    selectedImage: string | null;
    selectedColor?: string;
    colorPalette?: RGB[];
    isImageSelectDialogOpen: boolean;
}

interface TimeValues {
    sessionLength: number;
    breakLength: number;
    numberOfSessions: number;
}

export default function TimerDialog({ activeDialog, handleDialogChange }: TimerDialogProps) {
    const { showAlert } = useAlertStore();

    const [imageSettings, setImageSettings] = useState<ImageSettings>({
        selectedImage: null,
        selectedColor: undefined,
        colorPalette: undefined,
        isImageSelectDialogOpen: false,
    });

    const {
        setBackgroundImagePath,
        setAccentColor,
        setTimerSettings,

        sessionLengthInSeconds,
        breakLengthInSeconds,
        numberOfSessions,
    } = useTimerStore();

    const [timeValues, setTimeValues] = useState<TimeValues>({
        sessionLength: convertSeconds(sessionLengthInSeconds).minutes,
        breakLength: convertSeconds(breakLengthInSeconds).minutes,
        numberOfSessions: numberOfSessions,
    });

    const updateImageSettings = (updates: Partial<ImageSettings>) => {
        setImageSettings(prev => ({
            ...prev,
            ...updates,
        }));
    };

    const updateTimeValues = (updates: Partial<TimeValues>) => {
        setTimeValues(prev => ({
            ...prev,
            ...updates,
        }));
    };

    const handleSave = async () => {
        await saveBackgroundImage();
        saveTimeValues();

        handleDialogChange(false);
    };

    useEffect(() => {
        const changeColorPalette = async () => {
            if (imageSettings.selectedImage) {
                let colorPalette = await getColorPalette(imageSettings.selectedImage);
                updateImageSettings({ colorPalette });
            }
        };

        changeColorPalette();
    }, [imageSettings.selectedImage]);

    const saveBackgroundImage = async () => {
        if (!imageSettings.selectedImage) {
            return;
        }

        try {
            const savedBackgroundImagePath: string = await invoke("save_file", {
                from: imageSettings.selectedImage,
                to: await appConfigDir(),
                targetFolder: "timer/background-images",
            });

            setBackgroundImagePath(savedBackgroundImagePath);
            if (imageSettings.selectedColor) {
                setAccentColor(imageSettings.selectedColor);
            }
            updateImageSettings({ selectedImage: null });
        } catch (error) {
            showAlert({
                type: "error",
                title: "Unable to change background",
                message: (error as string) || "An unknown error occurred.",
            });
        }
    };

    const saveTimeValues = () => {
        setTimerSettings({
            sessionLengthInSeconds: timeValues.sessionLength * 60,
            breakLengthInSeconds: timeValues.breakLength * 60,
            numberOfSessions: timeValues.numberOfSessions,
        });
    };

    return (
        <Dialog open={activeDialog === "timer"} onOpenChange={handleDialogChange}>
            <DialogContent className="w-3/5 min-w-[32rem] max-w-3/5">
                <DialogHeader>
                    <DialogTitle>Timer</DialogTitle>
                    <DialogDescription>Change timer settings</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[32rem]">
                    <div className="flex flex-col gap-7 pr-5">
                        <Separator />

                        <BackgroundImageSelector
                            onImageSelect={image => updateImageSettings({ selectedImage: image })}
                            isImageSelectDialogOpen={imageSettings.isImageSelectDialogOpen}
                            setIsDialogOpen={open =>
                                updateImageSettings({ isImageSelectDialogOpen: open })
                            }
                        />

                        {imageSettings.selectedImage && (
                            <ImagePreview imagePath={imageSettings.selectedImage} />
                        )}
                        {imageSettings.colorPalette && (
                            <ColorPalette
                                colors={imageSettings.colorPalette}
                                onColorSelect={color =>
                                    updateImageSettings({ selectedColor: color })
                                }
                            />
                        )}

                        <Separator />

                        <TimeValueSelectors
                            timeValues={timeValues}
                            updateTimeValues={updateTimeValues}
                        />

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
