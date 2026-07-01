import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Loader2,
  Trash2,
  Mic,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play,
  Lock,
  Globe,
  Link2,
  Wand2,
} from "lucide-react";
import { useVoicesStore } from "@/store/useVoicesStore";
import { useTTSStore } from "@/store/useTTSStore";
import ParticleBackground from "@/components/ParticleBackground";
import TopBar from "@/components/TopBar";
import type { VoiceVisibility } from "@/types";

const VIS_OPTIONS: { value: VoiceVisibility; label: string; icon: typeof Lock }[] = [
  { value: "private", label: "私有", icon: Lock },
  { value: "unlist", label: "链接可见", icon: Link2 },
  { value: "public", label: "公开", icon: Globe },
];

export default function Clone() {
  const {
    samples,
    cloneForm,
    cloneStatus,
    cloneError,
    voices,
    listLoading,
    listError,
    addSample,
    removeSample,
    updateSampleText,
    clearSamples,
    setCloneField,
    clone,
    fetchVoices,
    removeVoice,
    refreshState,
  } = useVoicesStore();

  const setTTSParam = useTTSStore((s) => s.setParam);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 进入页面拉取一次列表
  useEffect(() => {
    fetchVoices();
  }, [fetchVoices]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => addSample(f));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const canClone = samples.length > 0 && cloneForm.title.trim() && cloneStatus !== "uploading";
  const isUploading = cloneStatus === "uploading";

  return (
    <div className="relative min-h-screen overflow-hidden bg-abyss text-ink-50">
      <ParticleBackground />
      <TopBar />

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-8 pb-16">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 pt-2"
        >
          <Fingerprint className="h-6 w-6 text-magenta" />
          <div>
            <h2 className="font-display text-2xl font-600 tracking-wide">
              声音克隆工作台
            </h2>
            <p className="font-mono text-[11px] text-ink-500">
              上传音频样本 · 训练专属神经语音模型 · 永久复用
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* 左：上传区 + 样本列表 */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass flex flex-col gap-4 rounded-2xl p-6"
          >
            {/* 拖拽区 */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition ${
                dragOver
                  ? "border-magenta bg-magenta/10"
                  : "border-edge bg-void/40 hover:border-magenta/50 hover:bg-magenta/5"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".wav,.mp3,.m4a,.opus,audio/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div className="relative mb-3">
                <div className="absolute inset-0 rounded-full bg-magenta/30 blur-xl" />
                <Upload className="relative h-8 w-8 text-magenta" />
              </div>
              <p className="font-display text-sm tracking-wide text-ink-100">
                拖拽音频样本到此处，或点击选择
              </p>
              <p className="mt-1 font-mono text-[10px] text-ink-500">
                支持 WAV / MP3 / M4A / OPUS · 至少 10 秒 · 可多选
              </p>
            </div>

            {/* 样本列表 */}
            <AnimatePresence>
              {samples.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink-300">
                      样本 ({samples.length})
                    </span>
                    <button
                      onClick={clearSamples}
                      className="font-mono text-[10px] text-ink-500 transition hover:text-magenta"
                    >
                      清空
                    </button>
                  </div>
                  {samples.map((s, i) => (
                    <SampleRow
                      key={i}
                      index={i}
                      filename={s.file.name}
                      size={s.file.size}
                      previewUrl={s.previewUrl}
                      text={s.text}
                      onText={(t) => updateSampleText(i, t)}
                      onRemove={() => removeSample(i)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 状态提示 */}
            <AnimatePresence>
              {cloneStatus === "error" && cloneError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 rounded-lg border border-magenta/30 bg-magenta/10 px-3 py-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-magenta" />
                  <span className="font-mono text-[11px] text-magenta">{cloneError}</span>
                </motion.div>
              )}
              {cloneStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-2"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan" />
                  <span className="font-mono text-[11px] text-cyan">
                    克隆成功 · 模型已就绪，可在 TTS 页面选择使用
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* 右：参数表单 */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass flex flex-col gap-5 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-cyan" />
              <h3 className="font-display text-sm font-500 tracking-wide">克隆配置</h3>
            </div>

            <div>
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-ink-300">
                声音标题 <span className="text-magenta">*</span>
              </label>
              <input
                value={cloneForm.title}
                onChange={(e) => setCloneField("title", e.target.value)}
                placeholder="例如：旁白男声"
                className="w-full rounded-lg border border-edge bg-void/60 px-3 py-2 font-mono text-xs text-ink-50 outline-none transition placeholder:text-ink-700 focus:border-magenta/50"
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-ink-300">
                描述
              </label>
              <textarea
                value={cloneForm.description || ""}
                onChange={(e) => setCloneField("description", e.target.value)}
                placeholder="可选 · 描述声音特征"
                rows={2}
                className="w-full resize-none rounded-lg border border-edge bg-void/60 px-3 py-2 font-mono text-xs text-ink-50 outline-none transition placeholder:text-ink-700 focus:border-magenta/50"
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-ink-300">
                可见性
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {VIS_OPTIONS.map((o) => {
                  const Icon = o.icon;
                  const active = cloneForm.visibility === o.value;
                  return (
                    <button
                      key={o.value}
                      onClick={() => setCloneField("visibility", o.value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 transition ${
                        active
                          ? "border-magenta/50 bg-magenta/10 text-magenta"
                          : "border-edge bg-void/40 text-ink-500 hover:text-ink-300"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="font-mono text-[10px]">{o.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-ink-300">
                  音频增强
                </div>
                <div className="font-mono text-[9px] text-ink-700">降噪 + 响度归一</div>
              </div>
              <button
                onClick={() => setCloneField("enhance_audio_quality", !cloneForm.enhance_audio_quality)}
                className={`relative h-5 w-10 rounded-full transition ${
                  cloneForm.enhance_audio_quality ? "bg-cyan-grad" : "bg-edge"
                }`}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-void ${
                    cloneForm.enhance_audio_quality ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-ink-300">
                  生成示例
                </div>
                <div className="font-mono text-[9px] text-ink-700">用默认文本预生成</div>
              </div>
              <button
                onClick={() => setCloneField("generate_sample", !cloneForm.generate_sample)}
                className={`relative h-5 w-10 rounded-full transition ${
                  cloneForm.generate_sample ? "bg-cyan-grad" : "bg-edge"
                }`}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-void ${
                    cloneForm.generate_sample ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>

            <button
              onClick={clone}
              disabled={!canClone}
              className="group relative mt-2 flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-magenta/40 bg-magenta/10 px-5 py-3 font-display text-sm font-500 tracking-wide text-magenta transition hover:bg-magenta/20 hover:shadow-magenta-glow disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在训练…
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  开始克隆
                </>
              )}
            </button>
          </motion.aside>
        </div>

        {/* 已克隆声音库 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-cyan" />
              <h3 className="font-display text-sm font-500 tracking-wide">我的声音库</h3>
              <span className="font-mono text-[10px] text-ink-500">
                ({voices.length})
              </span>
            </div>
            <button
              onClick={fetchVoices}
              disabled={listLoading}
              className="flex items-center gap-1.5 rounded-lg border border-edge bg-void/40 px-3 py-1.5 font-mono text-[10px] text-ink-300 transition hover:border-cyan/40 hover:text-cyan disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${listLoading ? "animate-spin" : ""}`} />
              刷新
            </button>
          </div>

          {listError && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-magenta/30 bg-magenta/10 px-3 py-2">
              <AlertCircle className="h-4 w-4 text-magenta" />
              <span className="font-mono text-[11px] text-magenta">{listError}</span>
            </div>
          )}

          {voices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Mic className="mb-2 h-8 w-8 text-ink-700" />
              <p className="font-mono text-[11px] text-ink-500">
                尚未克隆任何声音 · 上传音频样本开始
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {voices.map((v) => (
                <VoiceCard
                  key={v._id}
                  voice={v}
                  onUse={() => {
                    setTTSParam("reference_id", v._id);
                  }}
                  onDelete={() => removeVoice(v._id)}
                  onRefreshState={() => refreshState(v._id)}
                />
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}

function SampleRow({
  index,
  filename,
  size,
  previewUrl,
  text,
  onText,
  onRemove,
}: {
  index: number;
  filename: string;
  size: number;
  previewUrl: string;
  text: string;
  onText: (t: string) => void;
  onRemove: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
    } else {
      a.currentTime = 0;
      a.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  return (
    <div className="rounded-xl border border-edge bg-void/40 p-3">
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan/30 bg-cyan/10 text-cyan transition hover:bg-cyan/20"
        >
          <Play className="h-3 w-3" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-ink-500">#{index + 1}</span>
            <span className="truncate font-mono text-[11px] text-ink-100">{filename}</span>
          </div>
          <span className="font-mono text-[9px] text-ink-700">
            {(size / 1024).toFixed(1)} KB
          </span>
        </div>
        <button
          onClick={onRemove}
          className="flex h-6 w-6 items-center justify-center rounded-md text-ink-500 transition hover:bg-magenta/10 hover:text-magenta"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <audio
        ref={audioRef}
        src={previewUrl}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
      <input
        value={text}
        onChange={(e) => onText(e.target.value)}
        placeholder="对应文本（可选，提升发音精度）"
        className="mt-2 w-full rounded-md border border-edge bg-void/60 px-2.5 py-1.5 font-mono text-[10px] text-ink-100 outline-none transition placeholder:text-ink-700 focus:border-cyan/40"
      />
    </div>
  );
}

function VoiceCard({
  voice,
  onUse,
  onDelete,
  onRefreshState,
}: {
  voice: import("@/types").VoiceModel;
  onUse: () => void;
  onDelete: () => void;
  onRefreshState: () => void;
}) {
  const state = voice.state || "trained";
  const stateColor =
    state === "trained"
      ? "text-cyan"
      : state === "training"
        ? "text-ink-300"
        : state === "failed"
          ? "text-magenta"
          : "text-ink-500";

  return (
    <div className="group relative overflow-hidden rounded-xl border border-edge bg-void/40 p-4 transition hover:border-cyan/40">
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-display text-sm font-500 tracking-wide text-ink-50">
            {voice.title}
          </h4>
          <p className="truncate font-mono text-[9px] text-ink-700">{voice._id}</p>
        </div>
        <span className={`font-mono text-[9px] uppercase ${stateColor}`}>
          {state}
        </span>
      </div>

      {voice.description && (
        <p className="mb-2 line-clamp-2 font-mono text-[10px] text-ink-500">
          {voice.description}
        </p>
      )}

      <div className="mb-3 flex flex-wrap gap-1.5">
        {voice.visibility && (
          <span className="rounded border border-edge bg-void/60 px-1.5 py-0.5 font-mono text-[9px] text-ink-500">
            {voice.visibility}
          </span>
        )}
        {voice.languages?.map((l) => (
          <span
            key={l}
            className="rounded border border-edge bg-void/60 px-1.5 py-0.5 font-mono text-[9px] text-ink-500"
          >
            {l}
          </span>
        ))}
        {voice.tags?.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded border border-cyan/20 bg-cyan/5 px-1.5 py-0.5 font-mono text-[9px] text-cyan"
          >
            #{t}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onUse}
          disabled={state !== "trained"}
          className="flex-1 rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-1.5 font-mono text-[10px] tracking-wide text-cyan transition hover:bg-cyan/20 disabled:opacity-40"
        >
          用于 TTS
        </button>
        <button
          onClick={onRefreshState}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-edge text-ink-500 transition hover:text-ink-300"
          title="刷新状态"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
        <button
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-edge text-ink-500 transition hover:border-magenta/40 hover:text-magenta"
          title="删除"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
