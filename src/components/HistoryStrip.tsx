import { motion, AnimatePresence } from "framer-motion";
import { History, Play, Trash2, Clock } from "lucide-react";
import { useTTSStore } from "@/store/useTTSStore";
import { formatTime } from "@/lib/utils";

export default function HistoryStrip() {
  const { history, playHistory, removeHistory, clearHistory, currentAudioUrl } =
    useTTSStore();

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <History className="h-3.5 w-3.5 text-ink-500" />
          <h3 className="font-display text-xs font-500 tracking-[0.2em] text-ink-300">
            HISTORY
          </h3>
          <span className="font-mono text-[10px] text-ink-700">
            {history.length}
          </span>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="font-mono text-[10px] text-ink-700 transition hover:text-magenta"
          >
            清空
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {history.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-ink-700">
            <Clock className="h-5 w-5" />
            <span className="font-mono text-[10px] tracking-wide">
              暂无合成记录
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {history.map((item) => {
                const active = currentAudioUrl === item.audioUrl;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className={`group relative cursor-pointer rounded-xl border p-3 transition ${
                      active
                        ? "border-cyan/50 bg-cyan/5 shadow-cyan-glow"
                        : "border-edge bg-void/40 hover:border-cyan/30 hover:bg-void/60"
                    }`}
                    onClick={() => playHistory(item)}
                  >
                    {/* 缩略波形 */}
                    <div className="mb-2 flex h-5 items-center gap-[2px]">
                      {Array.from({ length: 28 }).map((_, i) => {
                        const h =
                          20 +
                          Math.abs(
                            Math.sin(i * 0.7 + item.id.charCodeAt(0)) * 60,
                          ) %
                            80;
                        return (
                          <div
                            key={i}
                            className={`flex-1 rounded-full ${
                              active ? "bg-cyan" : "bg-ink-700"
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        );
                      })}
                    </div>

                    <p
                      className={`mb-1.5 line-clamp-2 font-mono text-[11px] leading-relaxed ${
                        active ? "text-cyan" : "text-ink-300"
                      }`}
                    >
                      {item.textPreview}
                      {item.text.length > 40 && "…"}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-ink-700">
                        {formatTime(item.duration)} · {item.format.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[9px] text-ink-700">
                          {new Date(item.createdAt).toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHistory(item.id);
                          }}
                          className="ml-1 text-ink-700 opacity-0 transition group-hover:text-magenta group-hover:opacity-100"
                          aria-label="删除"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {active && (
                      <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-cyan text-void">
                        <Play className="h-2.5 w-2.5" fill="currentColor" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
