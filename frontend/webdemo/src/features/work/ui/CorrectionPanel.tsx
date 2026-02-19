import fieldImage from "../../../assets/pitch_1303x1024.jpg";
import { useRef } from "react";

type Coord = {
    x: number;
    y: number;
};

type Props = {
    original?: Coord;
    corrected?: Coord;
    onChange: (x: number, y: number) => void;
};

export function CorrectionPanel({
                                    original,
                                    corrected,
                                    onChange,
                                }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const imgWidth = rect.width;
        const imgHeight = rect.height;

        const videoX = Math.round((clickX / imgWidth) * 1024);
        const videoY = Math.round((clickY / imgHeight) * 1024);

        onChange(videoX, videoY);
    };

    const renderMarker = (coord: Coord, color: string) => (
        <div
            style={{
                position: "absolute",
                left: `${(coord.x / 1024) * 100}%`,
                top: `${(coord.y / 1024) * 100}%`,
                transform: "translate(-50%, -50%)",
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: `2px solid ${color}`,
                backgroundColor: "transparent",
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: 0,
                    width: 2,
                    height: "100%",
                    backgroundColor: color,
                    transform: "translateX(-50%)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    width: "100%",
                    height: 2,
                    backgroundColor: color,
                    transform: "translateY(-50%)",
                }}
            />
        </div>
    );

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            style={{
                position: "relative",
                flex: 1,
                cursor: "crosshair",
            }}
        >
            <img
                src={fieldImage}
                alt="Field"
                style={{ width: "100%", display: "block" }}
            />

            {original && renderMarker(original, "limegreen")}

            {corrected && renderMarker(corrected, "red")}
        </div>
    );
}
