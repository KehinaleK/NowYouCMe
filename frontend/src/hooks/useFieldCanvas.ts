import { useRef, useEffect, useState, MouseEvent } from "react";
import type { Coord, Corrected } from "../types";
import fieldImg from "../../assets/background_soccer.jpg";

const COORD_SCALE = 1024;
const CROSS_SIZE = 20;

function drawCross(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) {
  ctx.beginPath();
  ctx.moveTo(x, y - CROSS_SIZE);
  ctx.lineTo(x, y + CROSS_SIZE);
  ctx.moveTo(x - CROSS_SIZE, y);
  ctx.lineTo(x + CROSS_SIZE, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function useFieldCanvas(
  coords: Coord[],
  correctedMap: Record<number, Corrected>,
  currentFrame: number
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const [bgReady, setBgReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = fieldImg;
    img.onload = () => {
      bgImgRef.current = img;
      setBgReady(true);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    if (bgImgRef.current) {
      ctx.drawImage(bgImgRef.current, 0, 0, width, height);
    }

    const original = coords[currentFrame];
    if (!original) return;

    const ox = (original.x / COORD_SCALE) * width;
    const oy = (original.y / COORD_SCALE) * height;
    drawCross(ctx, ox, oy, "red");

    const corrected = correctedMap[currentFrame];
    if (corrected) {
      const cx = (corrected.new_x / COORD_SCALE) * width;
      const cy = (corrected.new_y / COORD_SCALE) * height;
      drawCross(ctx, cx, cy, "green");
    }
  }, [coords, correctedMap, currentFrame, bgReady]);

  function getClickCoords(
    e: MouseEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    return {
      x: Math.round((canvasX / rect.width) * COORD_SCALE),
      y: Math.round((canvasY / rect.height) * COORD_SCALE),
    };
  }

  return { canvasRef, getClickCoords };
}
