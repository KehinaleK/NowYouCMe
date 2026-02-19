import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { VideoPanel } from "../features/work/ui/VideoPanel";
import { CorrectionPanel } from "../features/work/ui/CorrectionPanel";

type FrameCoord = {
    frame_id: number;
    x: number;
    y: number;
};

export function WorkPage() {
    const { jobId } = useParams();

    const [videoUrl, setVideoUrl] = useState<string>("");
    const [fps, setFps] = useState<number>(25);
    const [currentTime, setCurrentTime] = useState<number>(0);

    const [originalFrames, setOriginalFrames] = useState<FrameCoord[]>([]);
    const [workingFrames, setWorkingFrames] = useState<FrameCoord[]>([]);

    // 🔥 Fetch (mocked)
    useEffect(() => {
        if (!jobId) return;
        /*fetch(/api/video/${jobId}/coordinates/)
        .then(res => res.json())
        .then(data => {
        setVideoUrl(data.video_url);
        setFps(data.fps);
        setOriginalFrames(data.coordinates);
        setWorkingFrames(data.coordinates); // clone
        }); */

        const mockData = {
            video_url: "/demo.mp4",
            fps: 25,
            coordinates: Array.from({ length: 200 }, (_, i) => ({
                frame_id: i,
                x: 200 + i,
                y: 300 + i,
            })),
        };

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVideoUrl(mockData.video_url);
        setFps(mockData.fps);
        setOriginalFrames(mockData.coordinates);
        setWorkingFrames(mockData.coordinates); // important
    }, [jobId]);

    // 🔥 Compute current frame
    const currentFrame = useMemo(() => {
        return Math.round(currentTime * fps);
    }, [currentTime, fps]);

    // 🔥 Get original & corrected for this frame
    const original = useMemo(() => {
        return originalFrames.find(f => f.frame_id === currentFrame);
    }, [originalFrames, currentFrame]);

    const corrected = useMemo(() => {
        return workingFrames.find(f => f.frame_id === currentFrame);
    }, [workingFrames, currentFrame]);

    // 🔥 Handle correction click
    const handleCorrection = (x: number, y: number) => {
        setWorkingFrames(prev => {
            const index = prev.findIndex(f => f.frame_id === currentFrame);

            if (index !== -1) {
                const updated = [...prev];
                updated[index] = { ...updated[index], x, y };
                return updated;
            } else {
                return [...prev, { frame_id: currentFrame, x, y }];
            }
        });
    };

    // 🔥 Save (mock)
    const saveCoordinates = () => {
        console.log("FINAL DATA:", workingFrames);
        alert("Saved locally (mock)");
        setOriginalFrames(workingFrames); // commit
        /*fetch(/video/${jobId}/save/,
        { method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates: workingFrames }),
        })
        .then(res => res.json())
        .then(data =>
        { if (data.success)
        { alert("Saved!");
          setOriginalFrames(workingFrames);
          // commit locally } }); */
    };

    // 🔥 Discard
    const discardChanges = () => {
        setWorkingFrames(originalFrames);
    };

    return (
        <main>
            <h1>Work Page</h1>

            <div style={{ display: "flex", gap: "24px" }}>
                <CorrectionPanel
                    original={
                        original
                            ? { x: original.x, y: original.y }
                            : undefined
                    }
                    corrected={
                        corrected
                            ? { x: corrected.x, y: corrected.y }
                            : undefined
                    }
                    onChange={handleCorrection}
                />

                <VideoPanel
                    src={videoUrl}
                    onPause={setCurrentTime}
                    onTimeUpdate={setCurrentTime}
                />
            </div>

            <p>
                Frame: {currentFrame}
                {" | "}
                Original:{" "}
                {original ? `(${original.x}, ${original.y})` : "N/A"}
                {" | "}
                Corrected:{" "}
                {corrected ? `(${corrected.x}, ${corrected.y})` : "N/A"}
            </p>

            <button onClick={saveCoordinates}>
                Save Coordinates
            </button>

            <button onClick={discardChanges} style={{ marginLeft: 10 }}>
                Discard Changes
            </button>
        </main>
    );
}

export default WorkPage;
