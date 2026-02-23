import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export function UploadPage() {

    const [videoFileName, setVideoFileName] = useState<string | null>(null);
    const [dataFileName, setDataFileName] = useState<string | null>(null);

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [dataFile, setDataFile] = useState<File | null>(null);

    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const handleVideoFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setVideoFile(file);
        setVideoFileName(file.name);
    };

    const handleDataFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setDataFile(file);
        setDataFileName(file.name);
    };

    const handleUpload = async () => {
        if (!videoFile || !dataFile) {
            alert("Please select both files.");
            return;
        }

        setUploading(true);

        setTimeout(() => {
            const fakeJobId = Math.floor(
                Math.random() * 100000
            ).toString();

            navigate(`/work/${fakeJobId}`);
            setUploading(false);
        }, 1200);

        /*
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
        */
    };

    return (
        <main>
            <header>
                <h1>Upload Page</h1>
            </header>

            <section>
                <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                />
                {videoFileName && (
                    <p>Selected Video: {videoFileName}</p>
                )}

                <input
                    type="file"
                    accept=".txt"
                    onChange={handleDataFileChange}
                />
                {dataFileName && (
                    <p>Selected Coordinates: {dataFileName}</p>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!videoFile || !dataFile || uploading}
                >
                    {uploading ? "Uploading..." : "Start Upload"}
                </button>
            </section>

            <section>
                <Link to="/">
                    <button>Go Home</button>
                </Link>
            </section>
        </main>
    );
}

export default UploadPage;
