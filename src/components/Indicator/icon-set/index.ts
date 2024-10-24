import Firefox from "./icons/firefox.svg?react";
import Gimp from "./icons/gimp.svg?react";
import VSCode from "./icons/vscode.svg?react";
import Code from "./icons/code.svg?react";
import Zed from "./icons/zed.svg?react";
import LibreOffice from "./icons/libreoffice.svg?react";
import Chrome from "./icons/chrome.svg?react";
import Obsidian from "./icons/obsidian.svg?react";
import VLC from "./icons/vlc.svg?react";

import { LucideProps, SquareTerminal, Shell, Video, Cpu } from "lucide-react";

export type SVGComponent =
    | React.FunctionComponent<
          React.SVGProps<SVGSVGElement> & {
              title?: string;
          }
      >
    | React.ForwardRefExoticComponent<
          Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
      >;

const customIconMap = new Map<string, SVGComponent>([
    ["firefox", Firefox],
    ["google-chrome", Chrome],
    ["alacritty", SquareTerminal],
    ["locus", Shell],
    ["vscode", VSCode],
    ["obsidian", Obsidian],
    ["zed", Zed],
    ["libreoffice", LibreOffice],
    ["vlc", VLC],
    ["gimp", Gimp],
    ["simplescreenrecorder", Video],
    ["cpu", Cpu],
]);

const genericIconMap = new Map<string, SVGComponent>([
    ["code", Code],
    ["terminal", SquareTerminal],
]);

export { customIconMap, genericIconMap };
