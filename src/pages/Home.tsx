import { motion } from "framer-motion";
import { Sparkles, Eraser, Loader2, AudioLines, Zap, CheckCircle2, XCircle } from "lucide-react";
import { useTTSStore } from "@/store/useTTSStore";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import ParticleBackground from "@/components/ParticleBackground";
import TopBar from "@/components/TopBar";
import ParameterPanel from "@/components/ParameterPanel";
import PlayerBar from "@/components/PlayerBar";
import HistoryStrip from "@/components/HistoryStrip";
import WaveformCanvas from "@/components/WaveformCanvas";

const MAX_CHARS = 5000;

export default function Home() {
  const { params, setParam, loadExample, clearText, status, synthesize, health, testHealth } =
    useTTSStore();
  const player = useAudioPlayer();
  const isSynth = status === "synthesizing";
  const charCount = params.text.length;
  const canSynth = charCount > 0 && !isSynth;

  const healthColor =
    health.status === "ok"
      ? "text-cyan"
      : health.status === "fail"
        ? "text-magenta"
        : "text-ink-300";
  const HealthIcon =
    health.status === "ok"
      ? CheckCircle2
      : health.status === "fail"
        ? XCircle
        : Loader2;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 flex h-full flex-col">
        <TopBar />

        {/* 主体三栏 */}
        <main className="flex min-h-0 flex-1 gap-4 px-8 pb-4">
          {/* 左栏：编辑器 + 波形 + 播放器 */}
          <section className="flex min-w-0 flex-1 flex-col gap-4">
            {/* 文本编辑器 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AudioLines className="h-4 w-4 text-cyan" />
                  <h2 className="font-display text-sm font-500 tracking-wide text-ink-50">
                    文本注入
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadExample}
                    className="flex items-center gap-1.5 rounded-lg border border-edge bg-void/40 px-2.5 py-1.5 font-mono text-[10px] tracking-wide text-ink-300 transition hover:border-cyan/40 hover:text-cyan"
                  >
                    <Sparkles className="h-3 w-3" />
                    示例
                  </button>
                  <button
                    onClick={clearText}
                    disabled={!params.text}
                    className="flex items-center gap-1.5 rounded-lg border border-edge bg-void/40 px-2.5 py-1.5 font-mono text-[10px] tracking-wide text-ink-300 transition hover:border-magenta/40 hover:text-magenta disabled:opacity-30"
                  >
                    <Eraser className="h-3 w-3" />
                    清空
                  </button>
                </div>
              </div>

              <textarea
                value={params.text}
                onChange={(e) => {
                  const v = e.target.value.slice(0, MAX_CHARS);
                  setParam("text", v);
                }}
                placeholder="在此输入文字，让神经网络将其锻造为声音…&#10;&#10;支持中英多语种，长文本将自动分段处理。"
                className="min-h-0 flex-1 resize-none bg-transparent font-body text-base leading-relaxed text-ink-50 outline-none placeholder:text-ink-700"
                spellCheck={false}
              />

              <div className="mt-2 flex items-center justify-between">
                <span className="font-serif text-sm italic text-ink-500">
                  Words become waves.
                </span>
                <span
                  className={`font-mono text-[10px] ${
                    charCount > MAX_CHARS * 0.9
                      ? "text-magenta"
                      : "text-ink-700"
                  }`}
                >
                  {charCount} / {MAX_CHARS}
                </span>
              </div>
            </motion.div>

            {/* 波形 + 合成按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass relative h-44 overflow-hidden rounded-2xl p-4"
            >
              <WaveformCanvas progress={player.progress} playing={player.playing} />

              {/* 合成按钮悬浮于右下 */}
              <button
                onClick={synthesize}
                disabled={!canSynth}
                className={`group absolute bottom-4 right-4 flex items-center gap-2.5 rounded-xl px-6 py-3 font-display text-sm font-600 tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  canSynth
                    ? "bg-cyan-grad text-void shadow-cyan-glow hover:scale-105"
                    : "bg-ink-700 text-ink-500"
                }`}
              >
                {isSynth ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    合成中
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 transition group-hover:rotate-12" />
                    锻造声音
                  </>
                )}
              </button>

              {/* 左侧状态标签 */}
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isSynth
                      ? "animate-pulse bg-cyan"
                      : status === "success"
                        ? "bg-cyan"
                        : status === "error"
                          ? "bg-magenta"
                          : "bg-ink-700"
                  }`}
                />
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-500">
                  {isSynth
                    ? "Synthesizing"
                    : status === "success"
                      ? "Rendered"
                      : status === "error"
                        ? "Error"
                        : "Standby"}
                </span>
              </div>
            </motion.div>

            {/* 播放器 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <PlayerBar player={player} />
            </motion.div>
          </section>

          {/* 右栏：控制面板 */}
          <aside className="flex w-[360px] shrink-0 flex-col gap-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="glass shrink-0 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HealthIcon
                    className={`h-4 w-4 ${healthColor} ${health.status === "checking" ? "animate-spin" : ""}`}
                  />
                  <div className="flex flex-col">
                    <span className="font-mono text-[11px] tracking-wide text-ink-300">
                      {health.status === "ok"
                        ? "已连接 S2.1 PRO"
                        : health.status === "fail"
                          ? "连接异常"
                          : health.status === "checking"
                            ? "检测中…"
                            : "服务就绪"}
                    </span>
                    {health.message && health.status !== "unknown" && (
                      <span className={`font-mono text-[9px] ${healthColor}`}>
                        {health.message}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={testHealth}
                  disabled={health.status === "checking"}
                  className="group flex items-center gap-1.5 rounded-lg border border-cyan/30 bg-cyan/5 px-3 py-1.5 font-mono text-[10px] tracking-wide text-cyan transition hover:bg-cyan/15 hover:shadow-cyan-glow disabled:opacity-50"
                >
                  <Zap className="h-3 w-3" />
                  测试
                </button>
              </div>
              <p className="mt-2.5 font-mono text-[9px] leading-relaxed text-ink-700">
                API Key 内嵌于服务端 .env，前端无需输入。
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="shrink-0"
            >
              <ParameterPanel />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="glass min-h-0 flex-1 rounded-2xl p-4"
            >
              <HistoryStrip />
            </motion.div>
          </aside>
        </main>
      </div>
    </div>
  );
}
