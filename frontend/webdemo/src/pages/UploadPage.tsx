import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export function UploadPage() {
    const [videoFileName, setVideoFileName] = useState<string | null>(null);
    const [dataFileName, setDataFileName] = useState<string | null>(null);

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [dataFile, setDataFile] = useState<File | null>(null);

    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const ALLOWED_VIDEO_TYPES = [
        "video/mp4",
        "video/x-matroska",
        "video/avi",
        "video/quicktime",
    ];

    const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mkv", ".avi", ".mov"];
    const ALLOWED_DATA_TYPES = ["text/plain"];
    const ALLOWED_DATA_EXTENSIONS = [".txt"];

    // 🔹 Handle video selection
    const handleVideoFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const hasValidMime =
            file.type && ALLOWED_VIDEO_TYPES.includes(file.type);

        const hasValidExtension = ALLOWED_VIDEO_EXTENSIONS.some(ext =>
            file.name.toLowerCase().endsWith(ext)
        );

        if (hasValidMime || hasValidExtension) {
            setVideoFile(file);
            setVideoFileName(file.name);
        } else {
            alert("Please select a valid video file (mp4, mkv, avi, mov).");
            event.target.value = "";
        }
    };

    // 🔹 Handle txt selection
    const handleDataFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const hasValidMime =
            file.type && ALLOWED_DATA_TYPES.includes(file.type);

        const hasValidExtension = ALLOWED_DATA_EXTENSIONS.some(ext =>
            file.name.toLowerCase().endsWith(ext)
        );

        if (hasValidMime || hasValidExtension) {
            setDataFile(file);
            setDataFileName(file.name);
        } else {
            alert("Please select a valid .txt coordinate file.");
            event.target.value = "";
        }
    };

    // 🔹 Upload handler
    const handleUpload = async () => {
        if (!videoFile || !dataFile) {
            alert("Please select both video and coordinate file.");
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append("video", videoFile);
        formData.append("coordinates", dataFile);

        try {
            const response = await fetch(
                "http://localhost:8000/api/upload/",
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();

            if (data.success) {
                navigate(`/work/${data.video_id}`);
            } else {
                alert(data.error || "Upload failed");
            }
        } catch (error) {
            console.error(error);
            alert("Error uploading file");
        } finally {
            setUploading(false);
        }
    };

    return (
        <main>
            <header>
                <h1>Upload Page</h1>
            </header>

            <section>
                <p>
                    Upload a video here: *.mp4, *.avi, *.mkv, *.mov
                </p>

                <input
                    type="file"
                    accept="video/mp4,video/x-matroska,video/avi,video/quicktime"
                    onChange={handleVideoFileChange}
                />
                {videoFileName && (
                    <p>Selected Video file: {videoFileName}</p>
                )}

                <input
                    type="file"
                    accept="text/plain"
                    onChange={handleDataFileChange}
                />
                {dataFileName && (
                    <p>Selected Coordinate file: {dataFileName}</p>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!videoFile || !dataFile || uploading}
                >
                    {uploading ? "Uploading..." : "Start upload"}
                </button>
            </section>

            <section>
                <h2>Navigation</h2>
                <Link to="/">
                    <button>Go to Home Page</button>
                </Link>
            </section>
        </main>
    );
}

export default UploadPage;
