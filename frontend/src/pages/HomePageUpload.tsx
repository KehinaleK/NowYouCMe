import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css"
export default function HomePageUpload() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coordsFile, setCoordsFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function upload() {
    if (!videoFile || !coordsFile) return;

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("coordinates", coordsFile);

    setLoading(true);

    fetch("http://localhost:8000/api/upload/", {
      method: "POST",
      body: formData,
      // if you use cookies/session auth, you may need:
      // credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setLoading(false);
        if (data.success) navigate(`/work/${data.video_id}`);
        else alert(data.error || "Upload failed");
      })
      .catch(() => {
        setLoading(false);
        alert("Network error");
      });
  }

  return (
    <div>
      <header>
        <h1>Upload Video and Coordinates files</h1>
        <div className="divider" />
      </header>

      <div className="upload-wrapper">
        <div className="upload-block">
          <h2>Video File</h2>

          <label className="custom-file-btn">
            Select Video
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="file-name">
            {videoFile ? videoFile.name : "No file selected"}
          </div>
        </div>

        <div className="upload-block">
          <h2>Coordinates File</h2>

          <label className="custom-file-btn">
            Select Data
            <input
              type="file"
              onChange={(e) => setCoordsFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="file-name">
            {coordsFile ? coordsFile.name : "No file selected"}
          </div>
        </div>
      </div>

      <div className="submit-section">
        <button
          className="main-btn"
          onClick={upload}
          disabled={loading || !videoFile || !coordsFile}
        >
          {loading ? "Uploading..." : "Upload Files"}
        </button>
      </div>

      {/* Optional: keep a result area like before */}
      {/* <div id="result"></div> */}
    </div>
  );
}
