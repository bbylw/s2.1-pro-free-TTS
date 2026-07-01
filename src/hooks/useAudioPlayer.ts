import { useEffect, useRef, useState, useCallback } from "react";
import { useTTSStore } from "@/store/useTTSStore";

/**
 * 统一音频播放 hook
 * 监听 store 中的 currentAudioUrl 切换音源
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrl = useTTSStore((s) => s.currentAudioUrl);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  // 初始化 audio 元素
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // 切换音源
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentAudioUrl) {
      audio.src = currentAudioUrl;
      audio.currentTime = 0;
      setProgress(0);
      setCurrent(0);
      // 自动播放
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      audio.pause();
      audio.src = "";
      setPlaying(false);
    }
  }, [currentAudioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrent(audio.currentTime);
      if (isFinite(audio.duration) && audio.duration > 0) {
        setProgress(audio.currentTime / audio.duration);
      }
    };
    const onDur = () => setDuration(isFinite(audio.duration) ? audio.duration : 0);
    const onEnd = () => {
      setPlaying(false);
      setProgress(1);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("durationchange", onDur);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("durationchange", onDur);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }, []);

  const seek = useCallback((frac: number) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(audio.duration)) return;
    audio.currentTime = frac * audio.duration;
    setProgress(frac);
    setCurrent(audio.currentTime);
  }, []);

  return { playing, progress, duration, current, toggle, seek };
}
