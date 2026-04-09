import { useEffect, useMemo, useRef, MouseEvent } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/WorkPage.css";
import { API_URL } from "../config";
import { useVideoData } from "../hooks/useVideoData";
import { useFrameNavigation } from "../hooks/useFrameNavigation";
import { useCoordinateCorrection } from "../hooks/useCoordinateCorrection";
import { useFieldCanvas } from "../hooks/useFieldCanvas";
import TutorialOverlay from "../components/TutorialOverlay";
import type { TutorialStep, TutorialHandle } from "../components/TutorialOverlay";

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: ".video-card",
    title: "Lecteur vidéo",
    description: "Votre vidéo importée. Utilisez les contrôles intégrés ou les boutons en dessous pour naviguer.",
    position: "left",
  },
  {
    target: ".video-controls",
    title: "Contrôles de navigation",
    description: "Naviguez trame par trame. Les boutons recul et avance déplacent d'une trame à la fois.",
    position: "left",
  },
  {
    target: ".canvas-card",
    title: "Vue du terrain",
    description: "La croix rouge indique la position actuelle du ballon selon vos données.",
    position: "right",
  },
  {
    target: ".field-canvas",
    title: "Corriger la position",
    description: "Cliquez n'importe où sur le terrain pour corriger la position du ballon. Une croix verte apparaîtra.",
    position: "right",
  },
  {
    target: ".coords-box",
    title: "Coordonnées",
    description: "Consultez les coordonnées originales et corrigées. Réinitialisez une correction si nécessaire.",
    position: "left",
  },
  {
    target: ".action-buttons",
    title: "Sauvegarder et télécharger",
    description: "Sauvegardez votre travail sur le serveur, ou téléchargez les coordonnées corrigées en fichier texte.",
    position: "left",
  },
  {
    target: ".timeline",
    title: "Barre de navigation",
    description: "Parcourez toutes les trames visuellement. La barre suit la lecture vidéo automatiquement. Cliquez sur une vignette pour y accéder.",
    position: "top",
  },
];

export default function WorkPage() {
  const { id } = useParams();
  const videoId = id ? Number(id) : NaN;
  const videoRef = useRef<HTMLVideoElement>(null);
  const tutorialRef = useRef<TutorialHandle>(null);

  const { loading, error, videoUrl, coords: initialCoords, frameTimestamps } =
    useVideoData(videoId);

  const { currentFrame, goToFrame, nextFrame, prevFrame, pauseVideo, onLoadedMetadata, onTimeUpdate } =
    useFrameNavigation(videoRef, frameTimestamps);

  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = timelineRef.current;
    if (!container) return;
    const activeEl = container.querySelector(".timeline-thumb.active");
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentFrame]);

  const { coords, correctedMap, applyCorrection, resetCorrection, saveCoordinates, downloadCoordinates } =
    useCoordinateCorrection(initialCoords, videoId);

  const { canvasRef, getClickCoords } =
    useFieldCanvas(coords, correctedMap, currentFrame);

  function onCanvasClick(e: MouseEvent<HTMLCanvasElement>) {
    const point = getClickCoords(e);
    if (!point) return;
    applyCorrection(currentFrame, point.x, point.y);
  }

  const coordsText = useMemo(() => {
    const original = coords[currentFrame];
    const corrected = correctedMap[currentFrame];

    if (!original) return `FRAME ${currentFrame}\nx: -, y: -`;

    let text = `FRAME ${currentFrame}\nCoords originales x: ${original.x}, y: ${original.y}`;
    if (corrected) {
      text += `\nCoords corrigées x: ${corrected.new_x}, y: ${corrected.new_y}`;
    }
    const ts = frameTimestamps[currentFrame];
    if (ts !== undefined) {
      text += `\nTimestamp début: ${ts.toFixed(3)} s`;
    }
    return text;
  }, [currentFrame, correctedMap, coords, frameTimestamps]);

  if (loading) return <p style={{ padding: "2rem" }}>Loading…</p>;
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  return (
    <div className="work-page">
      <div className="work-grid">
        <section className="left-col">
          <div className="canvas-card">
            <div className="canvas-wrap">
              <canvas
                ref={canvasRef}
                width={1050}
                height={680}
                onClick={onCanvasClick}
                className="field-canvas"
              />
            </div>
          </div>
        </section>

        <aside className="right-col">
          <div className="video-card">
            <div className="video-top">
              <h2>Vidéo</h2>
              <div className="video-top-actions">
                <button className="help-btn" onClick={() => tutorialRef.current?.start()}>
                  Aide
                </button>
                <Link className="back-link" to="/">
                  ⬅ Retour
                </Link>
              </div>
            </div>

            <video
              ref={videoRef}
              controls
              onLoadedMetadata={onLoadedMetadata}
              onPause={pauseVideo}
              onTimeUpdate={onTimeUpdate}
              className="video"
            >
              <source src={videoUrl} />
              Your browser does not support the video tag.
            </video>

            <div className="video-controls">
              <button onClick={pauseVideo}>Pause</button>
              <button onClick={prevFrame}>⬅</button>
              <button onClick={nextFrame}>➡</button>
            </div>
            <div className="fps-info">Custom frames: {coords.length}</div>
          </div>

          <div className="side-panel">
            <div className="action-buttons">
              <button className="save-btn" onClick={saveCoordinates}>
                Sauvegarder
              </button>
              <button className="download-btn" onClick={downloadCoordinates}>
                Télécharger
              </button>
            </div>
            <div className="coords-box">
              <div className="coords-title">Coordonnées</div>
              <pre className="coords-text">{coordsText}</pre>
              {correctedMap[currentFrame] && (
                <button
                  className="reset-btn"
                  onClick={() => resetCorrection(currentFrame)}
                >
                  Réinitialiser la correction
                </button>
              )}
            </div>
          </div>
        </aside>

        <section className="timeline">
          <div className="nav-title"></div>
          <div className="timeline-strip" ref={timelineRef}>
            {frameTimestamps.map((ts, i) => (
              <button
                key={i}
                className={`timeline-thumb ${i === currentFrame ? "active" : ""}`}
                onClick={() => goToFrame(i)}
              >
                <img
                  src={`${API_URL}/api/video/${videoId}/frame/${i}/`}
                  loading="lazy"
                  alt={`Frame ${i}`}
                />
                <span>{ts.toFixed(1)}s</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
