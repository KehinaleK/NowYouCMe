import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/WorkPage.css";

type Coord = { frame_id: number; x: number; y: number };

type Corrected = {
  frame_id: number;
  old_x: number;
  old_y: number;
  new_x: number;
  new_y: number;
};

type ApiVideoData = {
  success: boolean;
  video_id: number;
  video_url: string; 
  fps: number;
  coordinates: Coord[];
};

export default function WorkPage() {
  const { id } = useParams();
  const videoId = id ? Number(id) : NaN;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [videoUrl, setVideoUrl] = useState<string>("");
  const [fps, setFps] = useState<number>(25);
  const [coords, setCoords] = useState<Coord[]>([]);


  const [correctedMap, setCorrectedMap] = useState<Record<number, Corrected>>(
    {}
  );

  
  const [currentFrame, setCurrentFrame] = useState(0);


  useEffect(() => {
    if (!Number.isFinite(videoId)) return;

    setLoading(true);
    setError(null);

    fetch(`http://localhost:8000/api/video/${videoId}/`)
      .then((res) => {
        if (!res.ok) throw new Error(`GET /api/video/${videoId}/ failed`);
        return res.json() as Promise<ApiVideoData>;
      })
      .then((data) => {
        if (!data.success) throw new Error("API returned success=false");
        setVideoUrl(`http://localhost:8000${data.video_url}`);
        setFps(data.fps || 25);
        setCoords(data.coordinates || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [videoId]);

  const frameDuration = useMemo(() => 1 / (fps || 25), [fps]);

  function getCurrentFrame() {
    const v = videoRef.current;
    if (!v) return 0;
    return Math.round(v.currentTime * (fps || 25));
  }

  function syncCurrentFrame() {
    setCurrentFrame(getCurrentFrame());
  }

  function findOriginal(frame: number) {
    return coords.find((c) => c.frame_id === frame);
  }

 
  function canvasToVideoCoords(canvasX: number, canvasY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    return {
      x: Math.round((canvasX / canvasWidth) * 1024),
      y: Math.round((canvasY / canvasHeight) * 1024),
    };
  }

  function drawCross(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string
  ) {
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x, y + 20);
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x + 20, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawCoordinatesOnField(frameOverride?: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const frame = frameOverride ?? getCurrentFrame();
    const original = findOriginal(frame);
    if (!original) return;

    const ox = (original.x / 1024) * canvasWidth;
    const oy = (original.y / 1024) * canvasHeight;
    drawCross(ctx, ox, oy, "red");

    const corrected = correctedMap[frame];
    if (corrected) {
      const cx = (corrected.new_x / 1024) * canvasWidth;
      const cy = (corrected.new_y / 1024) * canvasHeight;
      drawCross(ctx, cx, cy, "green");
    }
  }

  
  useEffect(() => {
    drawCoordinatesOnField(currentFrame);

  }, [coords, correctedMap, fps, currentFrame]);

  function onLoadedMetadata() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;

    requestAnimationFrame(() => {
      syncCurrentFrame();
      drawCoordinatesOnField();
    });
  }


  function pauseVideo() {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    syncCurrentFrame();
    drawCoordinatesOnField();
  }

  function nextFrame() {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime += frameDuration;

    requestAnimationFrame(() => {
      syncCurrentFrame();
      drawCoordinatesOnField();
    });
  }

  function prevFrame() {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime -= frameDuration;
    if (v.currentTime < 0) v.currentTime = 0;

    requestAnimationFrame(() => {
      syncCurrentFrame();
      drawCoordinatesOnField();
    });
  }

  function resetCorrection() {
    setCorrectedMap((prev) => {
      if (!prev[currentFrame]) return prev;
      const copy = { ...prev };
      delete copy[currentFrame];
      return copy;
    });
  }

  function correctCoordinates(canvasX: number, canvasY: number) {
    const frame = getCurrentFrame();
    const original = findOriginal(frame);
    if (!original) return;

    const { x, y } = canvasToVideoCoords(canvasX, canvasY);

    setCorrectedMap((prev) => ({
      ...prev,
      [frame]: {
        frame_id: frame,
        old_x: original.x,
        old_y: original.y,
        new_x: x,
        new_y: y,
      },
    }));

    setCurrentFrame(frame);
  }

  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    correctCoordinates(canvasX, canvasY);
  }

  function buildFinalCoordinatesArray() {
    return coords.map((coord) => {
      const corrected = correctedMap[coord.frame_id];
      if (corrected) {
        return {
          frame_id: coord.frame_id,
          x: corrected.new_x,
          y: corrected.new_y,
        };
      }
      return { frame_id: coord.frame_id, x: coord.x, y: coord.y };
    });
  }

  function saveCoordinates() {
    const finalCoords = buildFinalCoordinatesArray();

    fetch(`http://localhost:8000/api/video/${videoId}/save/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coordinates: finalCoords }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) alert(`Saved:\n${data.file}`);
        else alert(`Save error: ${data.error}`);
      })
      .catch((e) => alert(String(e)));
  }


  const coordsText = useMemo(() => {
    const original = findOriginal(currentFrame);
    const corrected = correctedMap[currentFrame];

    if (!original) return `FRAME ${currentFrame}\nx: -, y: -`;

    let text = `FRAME ${currentFrame}\n`;
    text += `Coords originales x: ${original.x}, y: ${original.y}`;

    if (corrected) {
      text += `\nCoords corrigées x: ${corrected.new_x}, y: ${corrected.new_y}`;
    }
    return text;
  }, [currentFrame, coords, correctedMap]);

  
  function onTimeUpdate() {
    syncCurrentFrame();
    drawCoordinatesOnField();
  }

  if (loading) return <p style={{ padding: "2rem" }}>Loading…</p>;
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  const hasCorrection = !!correctedMap[currentFrame];

  return (
    <div className="work-page">
      <div className="work-grid">
   
        <section className="left-col">
          <div className="nav-bar">
            <div className="nav-title">NAVIGATION</div>
            <div className="nav-hint">Trames / timeline controls later</div>
          </div>

          <div className="canvas-card">
            <div className="canvas-header">
              <h2>Vue terrain</h2>
              <p>Clique pour corriger la position</p>
            </div>

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
              <Link className="back-link" to="/">
                ⬅ Importer un nouveau projet
              </Link>
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

            <div className="fps-info">FPS: {fps}</div>
          </div>

          <div className="side-panel">
            <button className="save-btn" onClick={saveCoordinates}>
              Sauvegarder les coordonnées
            </button>

            <div className="coords-box">
              <div className="coords-title">Coordonnées</div>
              <pre className="coords-text">{coordsText}</pre>

              <button
                className="reset-btn"
                onClick={resetCorrection}
                style={{ display: hasCorrection ? "inline-block" : "none" }}
              >
                Réinitialiser la correction
              </button>
            </div>
          </div>
        </aside>

   
        <section className="timeline">
          <div className="timeline-inner">
            <strong>TRAMES</strong>
            <span className="timeline-hint"> (à implémenter)</span>
          </div>
        </section>
      </div>
    </div>
  );
}
