import {Link} from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export function UploadPage() {
    // We will use local state to manage the selected file and upload status in this demo.
    const [videoFileName, setVideoFileName] = useState<string | null>(null);
    const [dataFileName,setDataFileName] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    // For simplicity, we only allow mp4 format in this demo. You can expand this list as needed.
    const ALLOWED_VIDEO_TYPES = [
        "video/mp4",
        "video/x-matroska", // mkv
        "video/avi",
        "video/quicktime", // mov
    ];

    const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mkv", ".avi", ".mov"];
    const ALLOWED_DATA_TYPES = ["text/plain"];
    const ALLOWED_DATA_EXTENSIONS = [".txt"];
    // Handle file selection and validate the file type
    const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const hasValidMime =
            file.type && ALLOWED_VIDEO_TYPES.includes(file.type);

        const hasValidExtension = ALLOWED_VIDEO_EXTENSIONS.some(ext =>
            file.name.toLowerCase().endsWith(ext)
        );

        if (hasValidMime || hasValidExtension) {
            setVideoFileName(file.name);
        } else {
            alert("Please select a valid video file (mp4, mkv, avi, mov).");
            event.target.value = ""; // reset input
        }

    };

        const handleDataFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            const hasValidMime =
                file.type && ALLOWED_DATA_TYPES.includes(file.type);

            const hasValidExtension = ALLOWED_DATA_EXTENSIONS.some(ext =>
                file.name.toLowerCase().endsWith(ext)
            );

            if (hasValidMime || hasValidExtension) {
                setDataFileName(file.name);
            } else {
                alert("Please select a valid video file (mp4, mkv, avi, mov).");
                event.target.value = ""; // reset input
            }

        };
    // Simulate the upload process and navigate to the work page with a fake job ID
    //TODO: Integrate with backend API to handle actual file upload and job creation
    const handleUpload = () => {
        if (!videoFileName && !dataFileName ) return;

        setUploading(true);

        setTimeout(() => {
            const fakeJobId = Math.floor(Math.random() * 100000).toString();
            navigate(`/work/${fakeJobId}`);

        }, 1000);
    };
    return (
        <main>
            <header>
                <h1>Upload Page</h1>
            </header>
            <section>
                <p>
                    Upload a video here: Correct formats: *.mp4, *.avi, *.mkv, *.mov
                </p>
                <input type='file' accept={'video/mp4,video/x-matroska,video/avi,video/quicktime'} onChange={handleVideoFileChange}/>
                {videoFileName && <p>Selected Video file: {videoFileName}</p>}
                <input type={'file'} accept={'text/plain'} onChange={handleDataFileChange}/>
                {dataFileName && <p>Selected Coordinate file: {dataFileName}</p>}
                <button onClick={handleUpload} disabled={(!videoFileName && !dataFileName)|| uploading}>
                    {uploading ? "Uploading..." : "Start upload"}
                </button>
            </section>
            <section>
                <h2> Go back or fwd</h2>
                <Link to="/">
                    <button>Go to Home Page</button>
                </Link>
            </section>

        </main>

    );
}
export default UploadPage;