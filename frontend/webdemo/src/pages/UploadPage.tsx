import {Link} from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export function UploadPage() {
    // We will use local state to manage the selected file and upload status in this demo.
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    // For simplicity, we only allow mp4 format in this demo. You can expand this list as needed.
    const ALLOWED_MIME_TYPES = [
        "video/mp4",
        "video/x-matroska", // mkv
        "video/avi",
        "video/quicktime", // mov
    ];

    const ALLOWED_EXTENSIONS = [".mp4", ".mkv", ".avi", ".mov"];

    // Handle file selection and validate the file type
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const hasValidMime =
            file.type && ALLOWED_MIME_TYPES.includes(file.type);

        const hasValidExtension = ALLOWED_EXTENSIONS.some(ext =>
            file.name.toLowerCase().endsWith(ext)
        );

        if (hasValidMime || hasValidExtension) {
            setFileName(file.name);
        } else {
            alert("Please select a valid video file (mp4, mkv, avi, mov).");
            event.target.value = ""; // reset input
        }

    };
    // Simulate the upload process and navigate to the work page with a fake job ID
    //TODO: Integrate with backend API to handle actual file upload and job creation
    const handleUpload = () => {
        if (!fileName) return;

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
                <input type='file' accept={'video/mp4,video/x-matroska,video/avi,video/quicktime'} onChange={handleFileChange}/>
                {fileName && <p>Selected file: {fileName}</p>}
                <button onClick={handleUpload} disabled={!fileName || uploading}>
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