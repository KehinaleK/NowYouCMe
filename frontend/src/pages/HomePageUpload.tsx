import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <main style={{ padding: "2rem" }}>
      <h1>Upload</h1>

      <input type="file" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
      <input type="file" onChange={(e) => setCoordsFile(e.target.files?.[0] ?? null)} />

      <button onClick={upload} disabled={loading || !videoFile || !coordsFile}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </main>
  );
}
