import { AlertTriangle, Github, Terminal } from "lucide-react";

export default function CompatibilityNotice() {
    return (
        <div className="min-h-screen bg-[#EBDEFC] flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-center mb-6">
                        <img src="/locus.svg" alt="Locus Logo" width={64} height={64} />
                        <h1 className="ml-3 text-2xl font-bold text-[#7335C8]">Locus</h1>
                    </div>

                    <div className="flex items-center justify-center mb-6">
                        <AlertTriangle className="w-6 h-6 text-[#7335C8] mr-2" />
                        <h2 className="text-xl font-semibold text-[#7335C8]">
                            Display Server Compatibility Notice
                        </h2>
                    </div>

                    <p className="text-gray-600 mb-6 text-center">
                        Your current display server might not be supported by Locus yet. We
                        currently only support X11 servers on Linux systems.
                    </p>

                    <div className="bg-[#F3EBFE] p-4 rounded-md mb-6">
                        <h3 className="font-semibold text-[#7335C8] mb-2 text-center">
                            Check your display server:
                        </h3>
                        <div className="flex items-center bg-[#7335C8] rounded p-2">
                            <Terminal className="w-5 h-5 text-white mr-2" />
                            <code className="text-white select-text">echo $XDG_SESSION_TYPE</code>
                        </div>
                    </div>

                    <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                        <li>
                            If the result is <strong className="text-[#7335C8]">x11</strong>, Locus
                            should work on your system. In that case please file a bug report on our
                            GitHub.
                        </li>
                        <li>
                            If the result is <strong className="text-[#7335C8]">wayland</strong> or
                            something else, we're still working on supporting your display server
                            type. Please open a ticket on GitHub so we can prioritize support for
                            your server.
                        </li>
                    </ul>

                    <div className="flex justify-center">
                        <a
                            href="https://github.com/Sushants-Git/locus/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#7335C8] hover:bg-[#5f2ba3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7335C8] transition-colors duration-200"
                        >
                            <Github className="w-5 h-5 mr-2" />
                            Report an Issue on GitHub
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
