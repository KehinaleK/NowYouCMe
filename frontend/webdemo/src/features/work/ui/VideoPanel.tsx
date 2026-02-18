import {useRef} from "react";


type Props = {
    src?: string;
    onPause: (time: number) => void;
    onTimeUpdate: (time: number) => void;
};

export function VideoPanel({ src, onPause, onTimeUpdate,}: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const handlePause = () => {
        if (!videoRef.current) return;
        onPause(videoRef.current.currentTime);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        onTimeUpdate(videoRef.current.currentTime);
    };
    return (
        <section
            style={{
                flex: 1,
                minWidth: 400,
            }}
        >
            <h2>Video</h2>
            <video
                src={src}
                ref={videoRef}
                controls
                style={{
                    width: "100%",
                    height: "auto",
                }}
                onPause={handlePause}
                onTimeUpdate={handleTimeUpdate}
            />
        </section>
    );
}