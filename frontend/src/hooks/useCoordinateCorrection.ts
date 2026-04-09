import { useState, useEffect } from "react";
import type { Coord, Corrected } from "../types";

export function useCoordinateCorrection(initialCoords: Coord[], videoId: number) {
  const [coords, setCoords] = useState<Coord[]>(initialCoords);
  const [correctedMap, setCorrectedMap] = useState<Record<number, Corrected>>(
    {}
  );

  useEffect(() => {
    setCoords(initialCoords);
    setCorrectedMap({});
  }, [initialCoords]);

  function applyCorrection(frame: number, newX: number, newY: number) {
    const original = coords[frame];
    if (!original) return;

    setCorrectedMap((prev) => ({
      ...prev,
      [frame]: {
        frame_id: frame,
        old_x: original.x,
        old_y: original.y,
        new_x: newX,
        new_y: newY,
      },
    }));
  }

  function resetCorrection(frame: number) {
    setCorrectedMap((prev) => {
      if (!prev[frame]) return prev;
      const copy = { ...prev };
      delete copy[frame];
      return copy;
    });
  }

  function buildFinalCoords(): Coord[] {
    return coords.map((coord, index) => {
      const corrected = correctedMap[index];
      return corrected
        ? { frame_id: coord.frame_id, x: corrected.new_x, y: corrected.new_y }
        : { frame_id: coord.frame_id, x: coord.x, y: coord.y };
    });
  }

  function saveCoordinates() {
    setCoords(buildFinalCoords());
    setCorrectedMap({});
  }

  function downloadCoordinates() {
    const lines = buildFinalCoords().map(
      (c) => `${c.frame_id}, ${c.x}, ${c.y}`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `video_${videoId}_coordinates.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return { coords, correctedMap, applyCorrection, resetCorrection, saveCoordinates, downloadCoordinates };
}
