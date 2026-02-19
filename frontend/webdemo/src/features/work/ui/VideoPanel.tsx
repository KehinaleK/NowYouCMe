import { useRef } from "react";

type Props = {
    src: string;
    onPause: (time: number) => void;
    onTimeUpdate: (time: number) => void;
};

export function VideoPanel({
                               src,
                               onPause,
                               onTimeUpdate,
                           }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handlePause = () => {
        if (!videoRef.current) return;
        onPause(videoRef.current.currentTime);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        onTimeUpdate(videoRef.current.currentTime);
    };


    const fastForward = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime += 1; // jump 1 sec
    };

    const rewind = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime -= 1;
        if (videoRef.current.currentTime < 0)
            videoRef.current.currentTime = 0;
    };

    return (
        <section style={{ flex: 1 }}>
            <h2>Video</h2>

            <video
                ref={videoRef}
                src={src}
                controls
                style={{ width: "100%" }}
                onPause={handlePause}
                onTimeUpdate={handleTimeUpdate}
            />

            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                <button onClick={rewind}>⏪ 1s</button>
                <button onClick={fastForward}>1s ⏩</button>
            </div>
        </section>
    );
}
