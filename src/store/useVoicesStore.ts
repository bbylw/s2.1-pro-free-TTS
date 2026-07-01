import { create } from "zustand";
import type { VoiceModel, CloneParams, CloneStatus } from "@/types";

interface VoiceSample {
  file: File;
  text: string;
  previewUrl: string;
}

interface VoicesStore {
  /** 当前已克隆的声音列表 */
  voices: VoiceModel[];
  listLoading: boolean;
  listError: string;

  cloneStatus: CloneStatus;
  cloneError: string;
  /** 最近一次克隆出的模型（用于跳转/提示） */
  lastClonedId: string | null;

  /** 用于克隆的待上传样本 */
  samples: VoiceSample[];

  /** 克隆参数（不含文件） */
  cloneForm: CloneParams;

  // 动作
  fetchVoices: () => Promise<void>;
  clone: () => Promise<VoiceModel | null>;
  removeVoice: (id: string) => Promise<void>;
  refreshState: (id: string) => Promise<void>;

  addSample: (file: File) => void;
  removeSample: (idx: number) => void;
  updateSampleText: (idx: number, text: string) => void;
  clearSamples: () => void;

  setCloneField: <K extends keyof CloneParams>(
    key: K,
    value: CloneParams[K],
  ) => void;
}

const ACCEPTED = [".wav", ".mp3", ".m4a", ".opus"];

export const useVoicesStore = create<VoicesStore>((set, get) => ({
  voices: [],
  listLoading: false,
  listError: "",
  cloneStatus: "idle",
  cloneError: "",
  lastClonedId: null,
  samples: [],
  cloneForm: {
    title: "",
    description: "",
    visibility: "private",
    texts: [],
    tags: [],
    enhance_audio_quality: true,
    generate_sample: false,
  },

  fetchVoices: async () => {
    set({ listLoading: true, listError: "" });
    try {
      const res = await fetch("/api/voices?page_size=50&self=true");
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `请求失败：${res.status}`);
      }
      const data = await res.json();
      const items: VoiceModel[] = Array.isArray(data?.items) ? data.items : [];
      set({ voices: items, listLoading: false });
    } catch (e) {
      set({
        listLoading: false,
        listError: e instanceof Error ? e.message : String(e),
      });
    }
  },

  clone: async () => {
    const { samples, cloneForm } = get();
    if (samples.length === 0) {
      set({ cloneStatus: "error", cloneError: "至少上传一个音频样本" });
      return null;
    }
    if (!cloneForm.title.trim()) {
      set({ cloneStatus: "error", cloneError: "请填写声音标题" });
      return null;
    }
    set({ cloneStatus: "uploading", cloneError: "" });
    try {
      const form = new FormData();
      samples.forEach((s) => form.append("voices", s.file, s.file.name));
      form.append("title", cloneForm.title.trim());
      form.append("visibility", cloneForm.visibility);
      form.append("enhance_audio_quality", String(cloneForm.enhance_audio_quality));
      form.append("generate_sample", String(cloneForm.generate_sample));
      if (cloneForm.description?.trim()) {
        form.append("description", cloneForm.description.trim());
      }
      // 每个 audio 对应的 text（提升发音精度）
      samples.forEach((s) => {
        if (s.text.trim()) form.append("texts", s.text.trim());
      });
      cloneForm.tags.forEach((t) => t.trim() && form.append("tags", t.trim()));

      const res = await fetch("/api/voices/clone", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `克隆失败：${res.status}`);
      }
      const voice: VoiceModel = await res.json();
      set((s) => ({
        cloneStatus: "success",
        cloneError: "",
        lastClonedId: voice._id,
        voices: [voice, ...s.voices],
      }));
      return voice;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ cloneStatus: "error", cloneError: msg });
      return null;
    }
  },

  removeVoice: async (id) => {
    try {
      const res = await fetch(`/api/voices/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `删除失败：${res.status}`);
      }
      set((s) => ({ voices: s.voices.filter((v) => v._id !== id) }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ listError: msg });
    }
  },

  refreshState: async (id) => {
    try {
      const res = await fetch(`/api/voices/${id}`);
      if (!res.ok) return;
      const voice: VoiceModel = await res.json();
      set((s) => ({
        voices: s.voices.map((v) => (v._id === id ? { ...v, ...voice } : v)),
      }));
    } catch {
      /* noop */
    }
  },

  addSample: (file) => {
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (!ACCEPTED.includes(ext)) return;
    set((s) => ({
      samples: [
        ...s.samples,
        {
          file,
          text: "",
          previewUrl: URL.createObjectURL(file),
        },
      ],
    }));
  },

  updateSampleText: (idx, text) =>
    set((s) => ({
      samples: s.samples.map((x, i) => (i === idx ? { ...x, text } : x)),
    })),

  removeSample: (idx) =>
    set((s) => {
      const target = s.samples[idx];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return { samples: s.samples.filter((_, i) => i !== idx) };
    }),

  clearSamples: () =>
    set((s) => {
      s.samples.forEach((x) => URL.revokeObjectURL(x.previewUrl));
      return { samples: [], cloneStatus: "idle", cloneError: "" };
    }),

  setCloneField: (key, value) =>
    set((s) => ({ cloneForm: { ...s.cloneForm, [key]: value } })),
}));
