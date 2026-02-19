import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";

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
  video_url: string; // "/media/..."
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

  // frame_id -> corrected
  const [correctedMap, setCorrectedMap] = useState<Record<number, Corrected>>(
    {}
  );

  // Fetch video data from Django
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

  function findOriginal(frame: number) {
    return coords.find((c) => c.frame_id === frame);
  }

  // Canvas helpers (same as your JS)
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

  function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x, y + 20);
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x + 20, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawCoordinatesOnField() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const currentFrame = getCurrentFrame();
    const original = findOriginal(currentFrame);
    if (!original) return;

    const ox = (original.x / 1024) * canvasWidth;
    const oy = (original.y / 1024) * canvasHeight;
    drawCross(ctx, ox, oy, "red");

    const corrected = correctedMap[currentFrame];
    if (corrected) {
      const cx = (corrected.new_x / 1024) * canvasWidth;
      const cy = (corrected.new_y / 1024) * canvasHeight;
      drawCross(ctx, cx, cy, "green");
    }
  }

  // Call this when video pauses / frame changes / correction changes
  useEffect(() => {
    drawCoordinatesOnField();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, correctedMap, fps]);

  // Show first frame once metadata loaded (same idea as your template)
  function onLoadedMetadata() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    drawCoordinatesOnField();
  }

  // Controls (same as your JS)
  function pauseVideo() {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    drawCoordinatesOnField();
  }

  function nextFrame() {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime += frameDuration;
    drawCoordinatesOnField();
  }

  function prevFrame() {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime -= frameDuration;
    if (v.currentTime < 0) v.currentTime = 0;
    drawCoordinatesOnField();
  }

  function resetCorrection() {
    const currentFrame = getCurrentFrame();
    setCorrectedMap((prev) => {
      if (!prev[currentFrame]) return prev;
      const copy = { ...prev };
      delete copy[currentFrame];
      return copy;
    });
  }

  function correctCoordinates(canvasX: number, canvasY: number) {
    const currentFrame = getCurrentFrame();
    const original = findOriginal(currentFrame);
    if (!original) return;

    const { x, y } = canvasToVideoCoords(canvasX, canvasY);

    setCorrectedMap((prev) => ({
      ...prev,
      [currentFrame]: {
        frame_id: currentFrame,
        old_x: original.x,
        old_y: original.y,
        new_x: x,
        new_y: y,
      },
    }));
  }

  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    correctCoordinates(canvasX, canvasY);
    // draw happens via state effect, but you can also call directly:
    // drawCoordinatesOnField();
  }

  function buildFinalCoordinatesArray() {
    return coords.map((coord) => {
      const corrected = correctedMap[coord.frame_id];
      if (corrected) {
        return { frame_id: coord.frame_id, x: corrected.new_x, y: corrected.new_y };
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

  // Display text like your coords-content div
  const coordsText = useMemo(() => {
    const currentFrame = getCurrentFrame();
    const original = findOriginal(currentFrame);
    const corrected = correctedMap[currentFrame];

    if (!original) return "x: -, y: -";

    let text = `FRAME ${currentFrame}\n`;
    text += `Coords originales x: ${original.x}, y: ${original.y}`;

    if (corrected) {
      text += `\nCoords corrigées x: ${corrected.new_x}, y: ${corrected.new_y}`;
    }
    return text;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, correctedMap, fps]); // current frame changes via events, see below

  // Update display/draw when time changes (so frame changes while scrubbing)
  function onTimeUpdate() {
    drawCoordinatesOnField();
    // coordsText relies on getCurrentFrame; easiest is to force a rerender:
    // (tiny hack: store a "tick" number)
    setTick((t) => t + 1);
  }
  const [tick, setTick] = useState(0); // just to refresh coordsText when time changes
  void tick;

  if (loading) return <p style={{ padding: "2rem" }}>Loading…</p>;
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  const currentFrame = getCurrentFrame();
  const hasCorrection = !!correctedMap[currentFrame];

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Video viewer</h1>

      <p>
        <Link to="/">⬅ Importer un nouveau projet</Link>
      </p>

      {/* Video */}
      <video
        ref={videoRef}
        width={400}
        controls
        onLoadedMetadata={onLoadedMetadata}
        onPause={pauseVideo}
        onTimeUpdate={onTimeUpdate}
      >
        <source src={videoUrl} />
        Your browser does not support the video tag.
      </video>

      {/* Coordinates display */}
      <div style={{ marginTop: 10, padding: 10, border: "1px solid black", width: 420 }}>
        <strong>Coordonnées:</strong>
        <pre style={{ whiteSpace: "pre-line" }}>{coordsText}</pre>

        <button
          onClick={resetCorrection}
          style={{ marginTop: 6, display: hasCorrection ? "inline-block" : "none" }}
        >
          Réinitialiser la correction
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1050}
        height={680}
        onClick={onCanvasClick}
        style={{ border: "1px solid black", display: "block", marginTop: 20 }}
      />

      <button onClick={saveCoordinates} style={{ marginTop: 15 }}>
        Sauvegarder les coordonnées
      </button>

      <p>FPS: {fps}</p>

      {/* Controls */}
      <button onClick={pauseVideo}>Pause</button>
      <button onClick={prevFrame}>⬅</button>
      <button onClick={nextFrame}>➡</button>
    </main>
  );
}
