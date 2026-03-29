import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/WorkPage.css";
import fieldImg from "../../assets/background_soccer.jpg";

const API_URL = "http://localhost:8000";

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
  coordinates: Coord[];
  frame_timestamps: number[];
  frame_preview_urls?: string[];
  duration?: number;
};

export default function WorkPage() {
  const { id } = useParams();
  const videoId = id ? Number(id) : NaN;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fieldImgRef = useRef<HTMLImageElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [videoUrl, setVideoUrl] = useState<string>("");
  const [coords, setCoords] = useState<Coord[]>([]);
  const [frameTimestamps, setFrameTimestamps] = useState<number[]>([]);

  const [correctedMap, setCorrectedMap] = useState<Record<number, Corrected>>(
    {}
  );

  const [currentFrame, setCurrentFrame] = useState(0);
  // const [timelineStart, setTimelineStart] = useState(0); // pour ma barre horizontale mais peut être enlevée

  // const TIMELINE_VISIBLE = 7;
  // const TIMELINE_STEP_FRAMES = 1;

  useEffect(() => {
    const img = new Image();
    img.src = fieldImg;
    img.onload = () => {
      fieldImgRef.current = img;
      drawCoordinatesOnField(currentFrame);
    };
  }, []);

  useEffect(() => {
    if (!Number.isFinite(videoId)) {
      setError("Invalid video id");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/video/${videoId}/`)
      .then(async (res) => {
        const text = await res.text();

        let data: ApiVideoData;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Invalid JSON returned by server: ${text}`);
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        return data;
      })
      .then((data) => {
        if (!data.success) {
          throw new Error("API returned success=false");
        }

        setVideoUrl(`${API_URL}${data.video_url}`);
        setCoords(data.coordinates || []);
        setFrameTimestamps(data.frame_timestamps || []);
        setCurrentFrame(0);
        // setTimelineStart(0);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [videoId]);

  function getCurrentFrameFromTime(currentTime: number) {
    if (frameTimestamps.length === 0) return 0;

    for (let i = frameTimestamps.length - 1; i >= 0; i--) {
      if (currentTime >= frameTimestamps[i]) {
        return i;
      }
    }

    return 0;
  }

  function getCurrentFrame() {
    const v = videoRef.current;
    if (!v) return 0;
    return getCurrentFrameFromTime(v.currentTime);
  }

  function syncCurrentFrame() {
    setCurrentFrame(getCurrentFrame());
  }

  function findOriginal(frame: number) {
    return coords[frame] ?? null;
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

    const bg = fieldImgRef.current;
    if (bg) {
      ctx.drawImage(bg, 0, 0, canvasWidth, canvasHeight);
    }

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
  }, [coords, correctedMap, currentFrame, frameTimestamps]);

  function onLoadedMetadata() {
    const v = videoRef.current;
    if (!v) return;

    v.currentTime = 0;

    requestAnimationFrame(() => {
      setCurrentFrame(0);
      drawCoordinatesOnField(0);
    });
  }

  function goToFrame(frame: number) {
    const v = videoRef.current;
    if (!v) return;
    if (frame < 0 || frame >= frameTimestamps.length) return;

    v.pause();
    v.currentTime = frameTimestamps[frame];
    setCurrentFrame(frame);

    requestAnimationFrame(() => {
      drawCoordinatesOnField(frame);
    });
  }


  // useEffect(() => { // pour a barre horizontale, same, peut être supp
  //   const half = Math.floor(TIMELINE_VISIBLE / 2);
  //   const desiredStart = Math.max(
  //     0,
  //     currentFrame - half * TIMELINE_STEP_FRAMES
  //   );
  //   setTimelineStart(desiredStart);
  // }, [currentFrame]);

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

    const next = Math.min(currentFrame + 1, frameTimestamps.length - 1);
    goToFrame(next);
  }

  function prevFrame() {
    const v = videoRef.current;
    if (!v) return;

    v.pause();

    const prev = Math.max(currentFrame - 1, 0);
    goToFrame(prev);
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
    return coords.map((coord, index) => {
      const corrected = correctedMap[index];

      if (corrected) {
        return {
          frame_id: coord.frame_id,
          x: corrected.new_x,
          y: corrected.new_y,
        };
      }

      return {
        frame_id: coord.frame_id,
        x: coord.x,
        y: coord.y,
      };
    });
  }

  function saveCoordinates() {
    const finalCoords = buildFinalCoordinatesArray();

    fetch(`${API_URL}/api/video/${videoId}/save/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coordinates: finalCoords }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          alert(`Saved:\n${data.file}`);
        } else {
          alert(`Save error: ${data.error}`);
        }
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

    const ts = frameTimestamps[currentFrame];
    if (ts !== undefined) {
      text += `\nTimestamp début: ${ts.toFixed(3)} s`;
    }

    return text;
  }, [currentFrame, correctedMap, coords, frameTimestamps]);

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

            <div className="fps-info">Custom frames: {coords.length}</div>
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

        {/* <section className="timeline"> MA VERSION DE LA BARRE HORIZONTALE, peut être enlevée
          <div className="timeline-bar">
            <button
              className="timeline-nav"
              onClick={() =>
                setTimelineStart((s) => Math.max(0, s - TIMELINE_VISIBLE))
              }
            >
              ◀
            </button>

            <div className="timeline-strip">
              {Array.from({ length: TIMELINE_VISIBLE }).map((_, i) => {
                const frame = timelineStart + i;
                const active = frame === currentFrame;
                const timestamp = frameTimestamps[frame];

                if (frame >= coords.length) return null;

                return (
                  <button
                    key={frame}
                    className={`timeline-cell ${active ? "active" : ""}`}
                    onClick={() => goToFrame(frame)}
                    title={`Frame ${frame}${timestamp !== undefined ? ` - ${timestamp.toFixed(3)}s` : ""}`}
                  >
                    <div className="cell-frame">Frame {frame}</div>
                  </button>
                );
              })}
            </div> */}

            {/* <button
              className="timeline-nav"
              onClick={() =>
                setTimelineStart((s) =>
                  Math.min(
                    Math.max(0, getTotalNumOfFrames() - TIMELINE_VISIBLE),
                    s + TIMELINE_VISIBLE
                  )
                )
              }
            >
              ▶
            </button>
          </div>
        </section> */}
      </div>
    </div>
  );
}