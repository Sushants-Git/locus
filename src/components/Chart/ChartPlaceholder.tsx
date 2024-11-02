import { Card, CardContent } from "@/components/ui/card";
import { useChartStore, useTimerStore } from "../../stores/settingStore";
import { useShallow } from "zustand/react/shallow";
import { LineChart } from "lucide-react";
import { defaults } from "../../constants";

export const ChartPlaceholder = () => {
    const accentColor = useTimerStore(state => state.accentColor);

    const minimumActivityDuration = useChartStore(
        useShallow(state => state.minimumActivityDuration)
    );

    return (
        <div className="w-screen">
            <div className="w-3/4 m-auto bg-white dark:bg-zinc-900 rounded-lg">
                <Card>
                    <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                        <div className="relative mb-6">
                            <div
                                className="absolute inset-0 rounded-full opacity-20"
                                style={{
                                    backgroundColor: accentColor || defaults.accentColor,
                                    transform: "scale(2)",
                                    filter: "blur(8px)",
                                }}
                            />
                            <LineChart
                                className="w-10 h-10 relative"
                                style={{ color: accentColor || defaults.accentColor }}
                            />
                        </div>

                        <div className="space-y-3 max-w-sm px-4">
                            <h3 className="text-lg font-medium text-foreground">
                                No Timeline Data Yet
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Start a session to visualize your activity
                            </p>

                            <div className="mt-6 text-xs text-muted-foreground/80 max-w-xs">
                                Focus on an activity for at least{" "}
                                <span className="font-medium text-foreground">
                                    {minimumActivityDuration} continuous seconds
                                </span>{" "}
                                to see it appear on your timeline
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-1.5">
                            {[40, 65, 45, 70, 50].map((width, i) => (
                                <div
                                    key={i}
                                    style={{
                                        backgroundColor: accentColor || defaults.accentColor,
                                        width: width,
                                        opacity: 0.15,
                                    }}
                                    className="h-4 rounded-sm transition-opacity duration-700"
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
