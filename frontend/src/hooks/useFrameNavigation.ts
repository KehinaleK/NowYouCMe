import { useState, useEffect, RefObject } from "react";

export function useFrameNavigation(
  videoRef: RefObject<HTMLVideoElement | null>,
  frameTimestamps: number[]
) {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    setCurrentFrame(0);
  }, [frameTimestamps]);

  function getFrameFromTime(time: number): number {
    for (let i = frameTimestamps.length - 1; i >= 0; i--) {
      if (time >= frameTimestamps[i]) return i;
    }
    return 0;
  }

  function goToFrame(frame: number) {
    const v = videoRef.current;
    if (!v || frame < 0 || frame >= frameTimestamps.length) return;
    v.pause();
    v.currentTime = frameTimestamps[frame];
    setCurrentFrame(frame);
  }

  function nextFrame() {
    if (!videoRef.current) return;
    videoRef.current.pause();
    goToFrame(Math.min(currentFrame + 1, frameTimestamps.length - 1));
  }

  function prevFrame() {
    if (!videoRef.current) return;
    videoRef.current.pause();
    goToFrame(Math.max(currentFrame - 1, 0));
  }

  function pauseVideo() {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    setCurrentFrame(getFrameFromTime(v.currentTime));
  }

  function onLoadedMetadata() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    requestAnimationFrame(() => setCurrentFrame(0));
  }

  function onTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    setCurrentFrame(getFrameFromTime(v.currentTime));
  }

  return {
    currentFrame,
    goToFrame,
    nextFrame,
    prevFrame,
    pauseVideo,
    onLoadedMetadata,
    onTimeUpdate,
  };
}
