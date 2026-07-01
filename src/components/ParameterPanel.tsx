import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, SlidersHorizontal, Fingerprint, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTTSStore } from "@/store/useTTSStore";
import { useVoicesStore } from "@/store/useVoicesStore";
import type { AudioFormat, LatencyMode } from "@/types";

const FORMATS: { value: AudioFormat; label: string }[] = [
  { value: "mp3", label: "MP3" },
  { value: "wav", label: "WAV" },
  { value: "opus", label: "OPUS" },
];

const LATENCIES: { value: LatencyMode; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

export default function ParameterPanel() {
  const { params, setParam } = useTTSStore();
  const { voices, fetchVoices } = useVoicesStore();
  const [open, setOpen] = useState(true);
  const [voicePickerOpen, setVoicePickerOpen] = useState(false);
  const [manualInput, setManualInput] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // 首次展开时拉取已克隆声音
  useEffect(() => {
    if (voices.length === 0) fetchVoices();
  }, [fetchVoices, voices.length]);

  // 点击外部关闭下拉
  useEffect(() => {
    if (!voicePickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setVoicePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [voicePickerOpen]);

  const selectedVoice = voices.find((v) => v._id === params.reference_id);
  const trainedVoices = voices.filter((v) => !v.state || v.state === "trained");

  return (
    <div className="glass rounded-2xl">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-magenta" />
          <h3 className="font-display text-sm font-500 tracking-wide text-ink-50">
            合成参数
          </h3>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-ink-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="space-y-5 px-5 pb-5">
          {/* 格式 */}
          <Field label="音频格式" hint="输出容器格式">
            <SegmentControl
              options={FORMATS}
              value={params.format}
              onChange={(v) => setParam("format", v as AudioFormat)}
            />
          </Field>

          {/* 延迟 */}
          <Field label="延迟模式" hint="low 牺牲质量换低延迟">
            <SegmentControl
              options={LATENCIES}
              value={params.latency}
              onChange={(v) => setParam("latency", v as LatencyMode)}
            />
          </Field>

          {/* reference_id 声音选择器 */}
          <Field label="声音模型" hint="选已克隆声音或手动输入 ID">
            <div ref={pickerRef} className="relative">
              {!manualInput ? (
                <button
                  onClick={() => setVoicePickerOpen((o) => !o)}
                  className="flex w-full items-center justify-between rounded-lg border border-edge bg-void/60 px-3 py-2 text-left transition hover:border-cyan/40"
                >
                  <div className="min-w-0 flex-1">
                    {selectedVoice ? (
                      <div className="flex flex-col">
                        <span className="truncate font-mono text-xs text-ink-50">
                          {selectedVoice.title}
                        </span>
                        <span className="truncate font-mono text-[9px] text-ink-700">
                          {selectedVoice._id}
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-ink-700">
                        默认声音（未指定）
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-ink-500 transition-transform ${
                      voicePickerOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={params.reference_id}
                    onChange={(e) => setParam("reference_id", e.target.value)}
                    placeholder="your_model_id"
                    spellCheck={false}
                    className="w-full rounded-lg border border-edge bg-void/60 px-3 py-2 font-mono text-xs text-ink-50 outline-none transition placeholder:text-ink-700 focus:border-cyan/50"
                  />
                  <button
                    onClick={() => setManualInput(false)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-500 transition hover:text-ink-300"
                    title="返回选择"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* 下拉面板 */}
              {voicePickerOpen && !manualInput && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-edge bg-abyss/95 backdrop-blur-xl"
                >
                  {/* 默认选项 */}
                  <button
                    onClick={() => {
                      setParam("reference_id", "");
                      setVoicePickerOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-cyan/10"
                  >
                    <span className="font-mono text-xs text-ink-300">默认声音</span>
                    {!params.reference_id && (
                      <span className="font-mono text-[9px] text-cyan">已选</span>
                    )}
                  </button>

                  {trainedVoices.length > 0 && (
                    <div className="border-t border-edge">
                      {trainedVoices.map((v) => (
                        <button
                          key={v._id}
                          onClick={() => {
                            setParam("reference_id", v._id);
                            setVoicePickerOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-cyan/10"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="truncate font-mono text-xs text-ink-50">
                              {v.title}
                            </div>
                            <div className="truncate font-mono text-[9px] text-ink-700">
                              {v._id}
                            </div>
                          </div>
                          {params.reference_id === v._id && (
                            <span className="shrink-0 font-mono text-[9px] text-cyan">
                              已选
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 底部操作 */}
                  <div className="border-t border-edge p-1.5">
                    <button
                      onClick={() => {
                        setManualInput(true);
                        setVoicePickerOpen(false);
                      }}
                      className="w-full rounded-md px-2 py-1.5 text-left font-mono text-[10px] text-ink-300 transition hover:bg-cyan/10 hover:text-cyan"
                    >
                      手动输入 ID…
                    </button>
                    <Link
                      to="/clone"
                      onClick={() => setVoicePickerOpen(false)}
                      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 font-mono text-[10px] text-magenta transition hover:bg-magenta/10"
                    >
                      <Fingerprint className="h-3 w-3" />
                      前往克隆新声音…
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </Field>

          {/* 速度 */}
          <SliderField
            label="语速"
            value={params.speed}
            min={0.5}
            max={2}
            step={0.1}
            display={`${params.speed.toFixed(1)}×`}
            onChange={(v) => setParam("speed", v)}
          />

          {/* 音量 */}
          <SliderField
            label="音量增益"
            value={params.volume}
            min={0}
            max={100}
            step={1}
            display={`${params.volume}`}
            onChange={(v) => setParam("volume", v)}
          />

          {/* 比特率 */}
          <SliderField
            label="比特率 (kbps)"
            value={params.bitrate}
            min={64}
            max={320}
            step={32}
            display={`${params.bitrate}`}
            onChange={(v) => setParam("bitrate", v)}
          />
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="font-mono text-[11px] uppercase tracking-wider text-ink-300">
          {label}
        </label>
        {hint && <span className="font-mono text-[9px] text-ink-700">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SegmentControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-edge bg-void/60 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`relative flex-1 rounded-md px-3 py-1.5 font-mono text-[11px] tracking-wide transition ${
            value === o.value
              ? "text-void"
              : "text-ink-500 hover:text-ink-300"
          }`}
        >
          {value === o.value && (
            <motion.div
              layoutId="seg-active"
              className="absolute inset-0 rounded-md bg-cyan-grad"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="font-mono text-[11px] uppercase tracking-wider text-ink-300">
          {label}
        </label>
        <span className="font-mono text-xs text-cyan">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
