import {Link} from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
export function WorkPage() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [workstatus, setWorkStatus] = useState<"pending"|"done">("pending");
    const [videoStatus, setVideoStatus]= useState<"sendingBackVideo" | "loading" | "done">("sendingBackVideo");
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
    return (
        <main>
            <header>
                <h1>Work Page</h1>
                <p>
                    Do your work here.
                </p>
            </header>
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