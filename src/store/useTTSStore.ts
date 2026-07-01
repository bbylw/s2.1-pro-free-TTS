import { create } from "zustand";
import type { TTSParams, HistoryItem, SynthStatus, HealthState } from "@/types";
import { uid, makePreview } from "@/lib/utils";

const DEFAULT_PARAMS: TTSParams = {
  text: "",
  reference_id: "",
  format: "mp3",
  bitrate: 128,
  speed: 1.0,
  volume: 0,
  latency: "normal",
  model: "s2.1-pro-free",
};

const EXAMPLE_TEXTS = [
  "你好，欢迎来到 SONIC FORGE 声音锻造台。在这里，文字将被赋予呼吸，化作流动的声波。",
  "The future of voice is not spoken, it is synthesized. Every waveform you hear was once a thought, now rendered into sound.",
  "在数字与声波的交界处，神经语音模型正在悄然重写人类表达的方式。",
  "Imagine a voice that never tires, never falters, and never grows old — only the words it carries do.",
];

interface TTSStore {
  params: TTSParams;
  status: SynthStatus;
  errorMessage: string;
  health: HealthState;
  history: HistoryItem[];
  currentAudioUrl: string | null;
  currentDuration: number;

  setParam: <K extends keyof TTSParams>(key: K, value: TTSParams[K]) => void;
  loadExample: () => void;
  clearText: () => void;
  setStatus: (s: SynthStatus, msg?: string) => void;
  setHealth: (h: HealthState) => void;
  synthesize: () => Promise<void>;
  testHealth: () => Promise<void>;
  playHistory: (item: HistoryItem) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
}

export const useTTSStore = create<TTSStore>((set, get) => ({
  params: DEFAULT_PARAMS,
  status: "idle",
  errorMessage: "",
  health: { status: "unknown", message: "" },
  history: [],
  currentAudioUrl: null,
  currentDuration: 0,

  setParam: (key, value) => set((s) => ({ params: { ...s.params, [key]: value } })),

  loadExample: () => {
    const ex = EXAMPLE_TEXTS[Math.floor(Math.random() * EXAMPLE_TEXTS.length)];
    set((s) => ({ params: { ...s.params, text: ex } }));
  },
  clearText: () => set((s) => ({ params: { ...s.params, text: "" } })),

  setStatus: (s, msg) => set({ status: s, errorMessage: msg || "" }),
  setHealth: (h) => set({ health: h }),

  synthesize: async () => {
    const { params } = get();
    if (!params.text.trim()) {
      set({ status: "error", errorMessage: "请先输入待合成的文本。" });
      return;
    }
    set({ status: "synthesizing", errorMessage: "", currentAudioUrl: null });
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `请求失败：${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      // 探测时长
      const duration = await new Promise<number>((resolve) => {
        const audio = new Audio(url);
        audio.onloadedmetadata = () => resolve(isFinite(audio.duration) ? audio.duration : 0);
        audio.onerror = () => resolve(0);
      });
      const item: HistoryItem = {
        id: uid(),
        text: params.text,
        textPreview: makePreview(params.text),
        audioUrl: url,
        duration,
        format: params.format,
        createdAt: Date.now(),
        params: { ...params },
      };
      set((s) => ({
        status: "success",
        currentAudioUrl: url,
        currentDuration: duration,
        history: [item, ...s.history].slice(0, 50),
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ status: "error", errorMessage: msg });
    }
  },

  testHealth: async () => {
    set({ health: { status: "checking", message: "检测中…" } });
    try {
      const res = await fetch("/api/tts/health");
      const data = await res.json();
      set({ health: { status: data.ok ? "ok" : "fail", message: data.message } });
    } catch (e) {
      set({ health: { status: "fail", message: e instanceof Error ? e.message : "检测失败" } });
    }
  },

  playHistory: (item) =>
    set({ currentAudioUrl: item.audioUrl, currentDuration: item.duration, status: "success" }),

  removeHistory: (id) =>
    set((s) => {
      const item = s.history.find((h) => h.id === id);
      if (item) URL.revokeObjectURL(item.audioUrl);
      return { history: s.history.filter((h) => h.id !== id) };
    }),

  clearHistory: () =>
    set((s) => {
      s.history.forEach((h) => URL.revokeObjectURL(h.audioUrl));
      return { history: [] };
    }),
}));
