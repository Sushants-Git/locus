import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen"
            style={{ backgroundColor: '#EBDEFC' }}
        >
            <div className="flex flex-col items-center space-y-4">
                <div className="flex flex-col items-center">
                    <img
                        src="/locus.svg"
                        alt="Locus Logo"
                        width={64}
                        height={64}
                    />
                    <h1
                        className="text-3xl font-bold tracking-tight mt-2"
                        style={{ color: '#7335C8' }}
                    >
                        Locus
                    </h1>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                    <Loader2
                        className="h-5 w-5 animate-spin"
                        style={{ color: '#7335C8' }}
                    />
                    <p
                        className="text-sm font-medium"
                        style={{ color: '#7335C8' }}
                    >
                        Loading...
                    </p>
                </div>
            </div>
        </div>
    )
}
