import { useEffect, useRef } from "react";
import { useTTSStore } from "@/store/useTTSStore";

interface Props {
  /** 播放进度 0-1 */
  progress: number;
  /** 是否正在播放 */
  playing: boolean;
}

/**
 * 波形可视化画布
 * - idle: 静态低能量条
 * - synthesizing: 中心脉冲圆环 + 高能量跳动
 * - success/playing: 频谱条 + 播放进度光带
 */
export default function WaveformCanvas({ progress, playing }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const status = useTTSStore((s) => s.status);
  const progressRef = useRef(progress);
  const playingRef = useRef(playing);
  const statusRef = useRef(status);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    const BARS = 64;
    // 用伪随机种子生成稳定的"静态波形"轮廓
    const seed = Array.from({ length: BARS }, (_, i) =>
      0.35 + Math.abs(Math.sin(i * 0.7) * 0.4 + Math.sin(i * 0.13) * 0.25),
    );

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);
      t += 0.05;

      const st = statusRef.current;
      const isSynth = st === "synthesizing";
      const isPlaying = playingRef.current && st === "success";
      const energy = isSynth ? 1 : isPlaying ? 0.85 : 0.3;

      // 中心脉冲圆环（仅合成中）
      if (isSynth) {
        const cx = w / 2;
        const cy = h / 2;
        for (let i = 0; i < 3; i++) {
          const phase = (t * 0.5 + i * 0.8) % 2;
          const r = phase * 60 + 8;
          const a = Math.max(0, 1 - phase / 2);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 240, 255, ${a * 0.6})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // 频谱条
      const gap = 3;
      const barW = (w - gap * (BARS - 1)) / BARS;
      const prog = progressRef.current;
      for (let i = 0; i < BARS; i++) {
        const base = seed[i];
        const wave =
          Math.sin(t * 1.2 + i * 0.3) * 0.18 +
          Math.sin(t * 2.1 + i * 0.7) * 0.12;
        const amp = Math.max(0.06, Math.min(1, base + wave * energy));
        const barH = amp * h * 0.9;
        const x = i * (barW + gap);
        const y = (h - barH) / 2;

        const barProgress = (i + 0.5) / BARS;
        const isPlayed = barProgress <= prog;
        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        if (isPlayed) {
          grad.addColorStop(0, "rgba(0, 240, 255, 0.95)");
          grad.addColorStop(1, "rgba(255, 45, 156, 0.75)");
        } else {
          grad.addColorStop(0, `rgba(122, 130, 168, ${0.35 + energy * 0.2})`);
          grad.addColorStop(1, `rgba(61, 67, 104, ${0.2 + energy * 0.15})`);
        }
        ctx.fillStyle = grad;
        roundRect(ctx, x, y, barW, barH, Math.min(barW / 2, 3));
        ctx.fill();

        // 顶部高光点
        if (isPlayed || isPlaying) {
          ctx.fillStyle = "rgba(232, 236, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(x + barW / 2, y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 播放进度光带
      if (prog > 0 && st === "success") {
        const px = prog * w;
        const lg = ctx.createLinearGradient(px - 30, 0, px + 30, 0);
        lg.addColorStop(0, "rgba(0, 240, 255, 0)");
        lg.addColorStop(0.5, "rgba(0, 240, 255, 0.35)");
        lg.addColorStop(1, "rgba(0, 240, 255, 0)");
        ctx.fillStyle = lg;
        ctx.fillRect(px - 30, 0, 60, h);
      }

      raf = requestAnimationFrame(draw);
    };

    const roundRect = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      bw: number,
      bh: number,
      r: number,
    ) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + bw, y, x + bw, y + bh, r);
      c.arcTo(x + bw, y + bh, x, y + bh, r);
      c.arcTo(x, y + bh, x, y, r);
      c.arcTo(x, y, x + bw, y, r);
      c.closePath();
    };

    resize();
    draw();
    window.addEventListener("resize", () => {
      resize();
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-label="音频波形可视化"
    />
  );
}
