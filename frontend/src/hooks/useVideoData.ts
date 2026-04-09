import { useState, useEffect } from "react";
import { API_URL } from "../config";
import type { Coord, ApiVideoData } from "../types";

export function useVideoData(videoId: number) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [coords, setCoords] = useState<Coord[]>([]);
  const [frameTimestamps, setFrameTimestamps] = useState<number[]>([]);

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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return data;
      })
      .then((data) => {
        if (!data.success) throw new Error("API returned success=false");
        setVideoUrl(`${API_URL}${data.video_url}`);
        setCoords(data.coordinates || []);
        setFrameTimestamps(data.frame_timestamps || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [videoId]);

  return { loading, error, videoUrl, coords, frameTimestamps };
}
