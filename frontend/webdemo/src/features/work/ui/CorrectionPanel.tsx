import pitchImage from "../../../assets/pitch_1024x865.jpg";
import { useRef, useState } from "react";
import type {MouseEvent} from "react";

type Props = {
    x: number; // original image space (1303x1024)
    y: number;
    onChange: (x: number, y: number) => void;
};

export function CorrectionPanel({ x, y, onChange }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const [scale, setScale] = useState({ x: 1, y: 1 });

    const handleImageLoad = () => {
        if (!imgRef.current) return;

        const renderedWidth = imgRef.current.clientWidth;
        const renderedHeight = imgRef.current.clientHeight;

        const naturalWidth = imgRef.current.naturalWidth;
        const naturalHeight = imgRef.current.naturalHeight;

        setScale({
            x: renderedWidth / naturalWidth,
            y: renderedHeight / naturalHeight,
        });
    };

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        const originalX = clickX / scale.x;
        const originalY = clickY / scale.y;

        onChange(originalX, originalY);
    };

    const mappedX = x * scale.x;
    const mappedY = y * scale.y;

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            style={{
                position: "relative",
                display: "inline-block",
                cursor: "crosshair",
            }}
        >
        <img
            ref={imgRef}
            src={pitchImage}
            onLoad={handleImageLoad}
            style={{
                maxWidth: "100%",
                height: "auto",
                display: "block",
            }}
         />
        <div
            style={{
                position: "absolute",
                left: mappedX - 4,
                top: mappedY - 4,
                width: 8,
                height: 8,
                backgroundColor: "red",
                borderRadius: "50%",
                pointerEvents: "none",
            }}
        />
    </div>
    );
}