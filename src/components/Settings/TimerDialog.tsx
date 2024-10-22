import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import { open } from "@tauri-apps/plugin-dialog";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { appConfigDir } from "@tauri-apps/api/path";
import { useTimerStore } from "../../stores/settingStore";
import useAlertStore from "../../stores/alertStore";

// @ts-ignore
import ColorThief from "colorthief";

type RGB = [number, number, number];

interface TimerDialogProps {
    activeDialog: string;
    handleDialogChange: (isOpen: boolean) => void;
}

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpeg", "jpg", "gif", "svg", "webp", "bmp", "ico"];

const ImagePreview: React.FC<{ imagePath: string }> = ({ imagePath }) => (
    <div className="relative rounded-lg bg-gray-100">
        <img
            src={convertFileSrc(imagePath)}
            className="m-auto max-h-64"
            alt="Selected background"
        />
    </div>
);

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
    onColorSelect: (color: string) => void;
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
                    Accent colors our used for custom styling some components (eg. bars on the
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

export default function TimerDialog({ activeDialog, handleDialogChange }: TimerDialogProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>();
    const [colorPalette, setColorPalette] = useState<RGB[]>();
    const [isImageSelectDialogOpen, setIsImageSelectDialogOpen] = useState(false);

    useEffect(() => {
        const changeColorPalette = async () => {
            if (selectedImage) {
                let colorPalette = await getColorPalette(selectedImage);
                setColorPalette(colorPalette);
            }
        };

        changeColorPalette();
    }, [selectedImage]);

    const { showAlert } = useAlertStore();

    const { setBackgroundImagePath: changeBackgroundImagePath, setAccentColor: changeAccentColor } =
        useTimerStore();

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
            if (selectedColor) {
                changeAccentColor(selectedColor);
            }
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
                        onColorSelect={setSelectedColor}
                        isImageSelectDialogOpen={isImageSelectDialogOpen}
                        setIsDialogOpen={setIsImageSelectDialogOpen}
                    />

                    {selectedImage && <ImagePreview imagePath={selectedImage} />}
                    {colorPalette && (
                        <ColorPalette colors={colorPalette} onColorSelect={setSelectedColor} />
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
