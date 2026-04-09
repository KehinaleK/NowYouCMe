import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import TutorialOverlay from "../components/TutorialOverlay";
import type { TutorialStep } from "../components/TutorialOverlay";
import "../styles/HomePage.css";

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: ".upload-block:first-child",
    title: "Fichier vidéo",
    description: "Sélectionnez votre fichier vidéo ici. Formats acceptés : MP4, MKV, AVI, MOV.",
    position: "bottom",
  },
  {
    target: ".upload-block:last-child",
    title: "Fichier de coordonnées",
    description: "Optionnel. Sélectionnez le fichier texte (.txt) contenant les positions du ballon pour chaque trame.",
    position: "bottom",
  },
  {
    target: ".main-btn",
    title: "Lancer l'analyse",
    description: "Une fois la vidéo sélectionnée, cliquez ici pour envoyer et commencer à travailler.",
    position: "top",
  },
];

const VIDEO_EXTENSIONS = [".mp4", ".mkv", ".avi", ".mov"];
const DATA_EXTENSIONS = [".txt"];

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/x-matroska",
  "video/quicktime",
  "video/avi",
  "video/x-msvideo",
  "application/mp4",
]);

const DATA_MIMES = new Set(["text/plain"]);

function validateFile(
  file: File,
  extensions: string[],
  mimes: Set<string>
): boolean {
  const name = file.name.toLowerCase();
  const extOk = extensions.some((ext) => name.endsWith(ext));
  const mime = (file.type || "").toLowerCase();
  const mimeOk = mime === "" || mimes.has(mime);
  return extOk && mimeOk;
}

export default function HomePageUpload() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coordsFile, setCoordsFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleVideoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateFile(file, VIDEO_EXTENSIONS, VIDEO_MIMES)) {
      setVideoFile(file);
    } else {
      alert(
        `Fichier vidéo invalide.\n` +
          `Nom: ${file.name}\n` +
          `Type détecté: ${file.type || "(vide)"}\n` +
          `Formats acceptés: ${VIDEO_EXTENSIONS.join(", ")}`
      );
      setVideoFile(null);
      e.target.value = "";
    }
  }

  function handleCoordsChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateFile(file, DATA_EXTENSIONS, DATA_MIMES)) {
      setCoordsFile(file);
    } else {
      alert(
        `Fichier de coordonnées invalide.\n` +
          `Nom: ${file.name}\n` +
          `Type détecté: ${file.type || "(vide)"}\n` +
          `Formats acceptés: ${DATA_EXTENSIONS.join(", ")}`
      );
      setCoordsFile(null);
      e.target.value = "";
    }
  }

  function upload() {
    if (!videoFile) return;

    const formData = new FormData();
    formData.append("video", videoFile);
    if (coordsFile) formData.append("coordinates", coordsFile);

    setLoading(true);

    fetch(`${API_URL}/api/upload/`, {
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
      <TutorialOverlay steps={TUTORIAL_STEPS} storageKey="tutorial-home" />
      <header>
        <h1>Choisissez une vidéo à analyser</h1>
        <div className="divider" />
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
          disabled={loading || !videoFile}
        >
          {loading ? "Uploading..." : "Upload Files"}
        </button>
      </div>
    </div>
  );
}
