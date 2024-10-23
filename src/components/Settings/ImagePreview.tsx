import { convertFileSrc } from "@tauri-apps/api/core";

const ImagePreview: React.FC<{ imagePath: string }> = ({ imagePath }) => (
    <div className="relative rounded-lg bg-gray-100">
        <img
            src={convertFileSrc(imagePath)}
            className="m-auto max-h-64"
            alt="Selected background"
        />
    </div>
);

export default ImagePreview;
