import { Clock, Cog } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useChartStore } from "../../stores/settingStore";

export default function MinimumActivityDuration() {
    const minimumActivityDuration = useChartStore(state => state.minimumActivityDuration);

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs flex gap-1">
                        <Clock className="mr-1 h-3 w-3" /> {minimumActivityDuration}s
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <div className="py-3 px-1">
                        <div className="space-y-1.5">
                            <h4 className="font-semibold text-sm leading-none">
                                Activity Threshold
                            </h4>
                            <div className="text-sm text-muted-foreground">
                                Activities under{" "}
                                <Badge variant="secondary" className="font-mono px-1 py-0 text-xs">
                                    {minimumActivityDuration}s
                                </Badge>{" "}
                                are ignored.
                            </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Cog className="h-3 w-3 mr-1.5" />
                            <span>Adjust in Settings &gt; Chart</span>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
