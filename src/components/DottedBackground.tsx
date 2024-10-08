type DottedBackgroundProps = {
    children: React.ReactNode;
};

const DottedBackground: React.FC<DottedBackgroundProps> = ({ children }) => {
    return (
        <>
            <div className="relative min-h-screen w-full bg-white overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.2) 0.5px, transparent 1px)`,
                        backgroundSize: "16px 16px",
                        backgroundPosition: "center center",
                        mask: "radial-gradient(circle, black, transparent 70%)",
                        WebkitMask: "radial-gradient(circle, black, transparent 70%)",
                    }}
                />
                <div className="absolute">{children}</div>
            </div>
        </>
    );
};

export default DottedBackground;
