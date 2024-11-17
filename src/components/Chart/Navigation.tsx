import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, History, Trash2 } from "lucide-react";
import { SessionHistory } from "src/model/SessionHistory";

interface NavButtonType {
    direction: "left" | "right";
    onClick: () => void;
    disabled: boolean;
}

const NavButton = ({ direction, onClick, disabled }: NavButtonType) => (
    <Button
        variant="outline"
        size="icon"
        onClick={onClick}
        disabled={disabled}
        className="rounded-full"
    >
        {direction === "left" ? (
            <ChevronLeft className="h-4 w-4" />
        ) : (
            <ChevronRight className="h-4 w-4" />
        )}
    </Button>
);

interface ChartCounterType {
    current: number;
    total: number;
}

const ChartCounter = ({ current, total }: ChartCounterType) => (
    <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{current}</span>
        <Badge variant="secondary" className="text-xs px-2 py-0">
            of {total}
        </Badge>
    </div>
);

interface DeleteDialogType {
    open: boolean;
    setOpen: (open: boolean) => void;
    onDelete: () => void;
}

const DeleteDialog = ({ open, setOpen, onDelete }: DeleteDialogType) => (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-white transition-colors"
            >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete chart</span>
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Delete Chart</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete this chart? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button variant="destructive" onClick={onDelete}>
                    Delete
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

interface ChartNavigationType {
    chartHistory: SessionHistory[];
    showingHistory: boolean;
    historyIndex: number;
    onBack: () => void;
    onForward: () => void;
    onDelete: () => void;
}

const ChartNavigation = ({
    chartHistory,
    showingHistory,
    historyIndex,
    onBack,
    onForward,
    onDelete,
}: ChartNavigationType) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    if (!chartHistory.length) return null;

    return (
        <div className="w-3/4 m-auto mb-4 flex justify-between items-center">
            <NavButton direction="left" onClick={onBack} disabled={!chartHistory.length} />

            {showingHistory && (
                <div className="flex gap-2 items-center">
                    <ChartCounter current={historyIndex + 1} total={chartHistory.length} />
                    <DeleteDialog
                        open={deleteDialogOpen}
                        setOpen={setDeleteDialogOpen}
                        onDelete={() => {
                            onDelete();
                            setDeleteDialogOpen(false);
                        }}
                    />
                </div>
            )}

            <NavButton
                direction="right"
                onClick={onForward}
                disabled={!showingHistory && !chartHistory.length}
            />
        </div>
    );
};

export default ChartNavigation;
