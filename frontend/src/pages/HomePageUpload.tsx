import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import HelpPage from "./HelpPage"; 

export default function HomePageUpload() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coordsFile, setCoordsFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mkv", ".avi", ".mov"];
  const ALLOWED_DATA_EXTENSIONS = [".txt"];


  const ALLOWED_VIDEO_MIMES = new Set([
    "video/mp4",
    "video/x-matroska",
    "video/quicktime",
    "video/avi", 
    "video/x-msvideo", 
    "application/mp4", 
  ]);

  const ALLOWED_DATA_MIMES = new Set(["text/plain"]);


  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    const extOk = ALLOWED_VIDEO_EXTENSIONS.some((ext) => name.endsWith(ext));

    const mime = (file.type || "").toLowerCase();
    const mimeOk = mime === "" ? true : ALLOWED_VIDEO_MIMES.has(mime);

    if (extOk && mimeOk) {
      setVideoFile(file);
    } else {
      alert(
        `Fichier vidéo invalide.\n` +
          `Nom: ${file.name}\n` +
          `Type détecté: ${file.type || "(vide)"}\n` +
          `Formats acceptés: ${ALLOWED_VIDEO_EXTENSIONS.join(", ")}`
      );
      setVideoFile(null);
      e.target.value = "";
    }

   
  };

  const handleCoordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    const extOk = ALLOWED_DATA_EXTENSIONS.some((ext) => name.endsWith(ext));

    const mime = (file.type || "").toLowerCase();

    const mimeOk = mime === "" ? true : ALLOWED_DATA_MIMES.has(mime);

    if (extOk && mimeOk) {
      setCoordsFile(file);
    } else {
      alert(
        `Fichier de coordonnées invalide.\n` +
          `Nom: ${file.name}\n` +
          `Type détecté: ${file.type || "(vide)"}\n` +
          `Formats acceptés: ${ALLOWED_DATA_EXTENSIONS.join(", ")}`
      );
      setCoordsFile(null);
      e.target.value = "";
    }

  };

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
    <div>
      {/*Ajout HELP overlay */}
      {showHelp && (
      <HelpPage onClose={() => setShowHelp(false)} />
      )}
      <header>
        <h1>Choisissez une vidéo et les coordonnées correspondantes</h1>
        <div className="divider" />

        {/*Bouton Help*/}
        <button
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "10px 16px",
            borderRadius: "20px", 
            border: "none",
            background: "#111",
            color: "white",
            fontWeight: "500",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
          onClick={() => setShowHelp(true)}
        >
          Need help ?
        </button>
      </header>

      <div className="upload-wrapper">
        <div className="upload-block">
          <h2>Fichier vidéo</h2>

          <label className="custom-file-btn">
            Sélectionner vidéo
            <input
              type="file"
            
              accept="video/mp4,video/*,.mp4,.mkv,.avi,.mov"
              onChange={handleVideoChange}
            />
          </label>

          <div className="file-name">
            {videoFile ? videoFile.name : "No file selected"}
          </div>
        </div>

        <div className="upload-block">
          <h2>Fichier de coordonnées</h2>

          <label className="custom-file-btn">
            Sélectionner coordonnées
            <input
              type="file"
              accept="text/plain,.txt"
              onChange={handleCoordsChange}
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
    </div>
  );
}