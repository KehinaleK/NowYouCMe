import {Link} from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { JobHeader } from "../features/work/ui/JobHeader";
import { VideoPanel } from "../features/work/ui/VideoPanel";
import { CorrectionPanel } from "../features/work/ui/CorrectionPanel";
function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    const paddedMinutes = String(minutes).padStart(2, "0");
    const paddedSeconds = String(seconds).padStart(2, "0");

    return `${paddedMinutes}:${paddedSeconds}`;
}
export function WorkPage() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [workstatus, setWorkStatus] = useState<"pending"|"done">("pending");
    const [videoStatus, setVideoStatus]= useState<"sendingBackVideo" | "loading" | "done">("sendingBackVideo");
    const [currentTime, setCurrentTime] = useState(0);
    const demoVideoUrl = "/demo.mp4";

    //Simulate video processing status changes.
    useEffect(() => {
        if (videoStatus !== "sendingBackVideo") return;

        const timer = setTimeout(() => {
            setVideoStatus("loading");
        }, 1000);

        return () => clearTimeout(timer);
    }, [videoStatus]);
    useEffect(() => {
        if (videoStatus !== "loading") return;

        const timer = setTimeout(() => {
            setVideoStatus("done");
        }, 2000);

        return () => clearTimeout(timer);
    }, [videoStatus]);

    //Check job status and navigate to result page when done.
    //TODO: Check for real job status from user.
    const hanleGoResult = () => {
        if (workstatus !== "done") return;
        navigate(`/result/${jobId}`);
    }
    const [ballPosition, setBallPosition] = useState({
        x: 0,
        y: 0,
    });

    return (
        <main>
            <JobHeader jobId={jobId} status={videoStatus} />
            <div
                style={{
                    display: "flex",
                    gap: "24px",
                    alignItems: "flex-start",
                }}
            >
                <section
                    style={{
                        flex: 1,
                        minWidth: 400,
                    }}
                >
                <CorrectionPanel
                    x={ballPosition.x}
                    y={ballPosition.y}
                    onChange={(x, y) => {
                    setBallPosition({
                    x: Math.round(x),
                    y: Math.round(y),
                    })}}

                />
                </section>
                <VideoPanel
                    src={demoVideoUrl}
                    onPause={(time) => {
                        setCurrentTime(time);}}
                    onTimeUpdate={(time) => {
                    setCurrentTime(time);}}
                />

            </div>
            <div style={{ marginTop: 20 }}>
                <p>{formatTime(currentTime)} | X: {ballPosition.x} | Y: {ballPosition.y}</p>
            </div>
            <section>
                <h2>Work in progress</h2>
                <p>Job ID: {jobId}</p>

                <p>Status: {videoStatus}</p>
                {videoStatus === "loading" && <p>Processing video…</p>}
                <button onClick={()=> setWorkStatus("done")} disabled={videoStatus !== "done"}>
                    Finish
                </button>
                <button onClick={hanleGoResult} disabled={workstatus !== "done"}>
                    Go to result
                </button>
            </section>
            <section>
                <h2> Go Home</h2>
                <Link to="/">
                    <button>Go to Home Page</button>
                </Link>
            </section>
        </main>
    );
}
export default WorkPage;