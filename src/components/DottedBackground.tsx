import { useTheme } from "@/components/ui/theme-provider";

type DottedBackgroundProps = {
    children: React.ReactNode;
};

export default function DottedBackground({ children }: DottedBackgroundProps) {
    const { theme } = useTheme();

    return (
        <div className="relative min-h-screen w-full bg-white dark:bg-background overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle, ${
                        theme === "dark" ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)"
                    } 0.5px, transparent 1px)`,
                    backgroundSize: "16px 16px",
                    backgroundPosition: "center center",
                    mask: "radial-gradient(circle, black, transparent 70%)",
                    WebkitMask: "radial-gradient(circle, black, transparent 70%)",
                }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
}
