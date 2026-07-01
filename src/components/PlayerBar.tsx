import { motion } from "framer-motion";
import { Play, Pause, Download, AlertTriangle } from "lucide-react";
import { useTTSStore } from "@/store/useTTSStore";
import { formatTime } from "@/lib/utils";
import type { useAudioPlayer } from "@/hooks/useAudioPlayer";

interface Props {
  player: ReturnType<typeof useAudioPlayer>;
}

export default function PlayerBar({ player }: Props) {
  const { status, errorMessage, currentAudioUrl, params, history } =
    useTTSStore();
  const hasAudio = !!currentAudioUrl && status === "success";
  const latest = history[0];

  const download = () => {
    if (!currentAudioUrl) return;
    const a = document.createElement("a");
    a.href = currentAudioUrl;
    a.download = `sonic-forge-${Date.now()}.${params.format}`;
    a.click();
  };

  return (
    <div className="glass-strong rounded-2xl px-5 py-4 shadow-panel">
      <div className="flex items-center gap-4">
        {/* 播放按钮 */}
        <button
          onClick={player.toggle}
          disabled={!hasAudio}
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition disabled:opacity-30 ${
            hasAudio
              ? "bg-cyan-grad text-void shadow-cyan-glow hover:scale-105"
              : "bg-ink-700 text-ink-500"
          }`}
          aria-label={player.playing ? "暂停" : "播放"}
        >
          {player.playing ? (
            <Pause className="h-5 w-5" fill="currentColor" />
          ) : (
            <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
          )}
          {player.playing && (
            <span className="absolute inset-0 animate-pulse-ring rounded-full border border-cyan" />
          )}
        </button>

        {/* 时间 */}
        <div className="flex w-20 shrink-0 flex-col">
          <span className="font-mono text-xs text-cyan">
            {formatTime(player.current)}
          </span>
          <span className="font-mono text-[10px] text-ink-500">
            {formatTime(player.duration)}
          </span>
        </div>

        {/* 进度条 */}
        <div
          className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-ink-700/50"
          onClick={(e) => {
            if (!hasAudio) return;
            const rect = e.currentTarget.getBoundingClientRect();
            player.seek((e.clientX - rect.left) / rect.width);
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-cyan-grad"
            style={{ width: `${player.progress * 100}%` }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-50 opacity-0 shadow-cyan-glow transition group-hover:opacity-100"
            style={{ left: `${player.progress * 100}%` }}
          />
        </div>

        {/* 下载 */}
        <button
          onClick={download}
          disabled={!hasAudio}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-edge bg-void/40 text-ink-300 transition hover:border-cyan/40 hover:text-cyan disabled:opacity-30"
          aria-label="下载音频"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* 状态文案 */}
      <div className="mt-3 flex min-h-[18px] items-center gap-2">
        {status === "error" && errorMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5"
          >
            <AlertTriangle className="h-3 w-3 text-magenta" />
            <span className="font-mono text-[11px] text-magenta">
              {errorMessage}
            </span>
          </motion.div>
        ) : status === "synthesizing" ? (
          <span className="font-mono text-[11px] text-cyan">
            正在向 S2.1 Pro 神经网络注入文字…
          </span>
        ) : hasAudio && latest ? (
          <span className="truncate font-mono text-[11px] text-ink-500">
            ▸ {latest.textPreview}
          </span>
        ) : (
          <span className="font-mono text-[11px] text-ink-700">
            待命中 · 输入文字后点击合成
          </span>
        )}
      </div>
    </div>
  );
}
