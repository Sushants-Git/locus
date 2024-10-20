import NumberFlow from "@number-flow/react";

export default function Timer() {
    let minute = 40;
    let second = 50;

    return (
        <div className="font-bricolage-grotesque mb-5 mt-5">
            <div
                className="text-9xl tabular-nums text-white font-600 m-auto w-fit border rounded-lg px-8 relative group select-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),url(/background/background.png)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                }}
            >
                <NumberFlow
                    value={minute}
                    format={{ notation: "compact" }}
                    isolate
                    className="[--number-flow-char-height:0.80em]"
                />
                :
                <NumberFlow
                    value={second}
                    format={{ notation: "compact", minimumIntegerDigits: 2 }}
                    isolate
                    className="[--number-flow-char-height:0.80em]"
                />
            </div>
        </div>
    );
}