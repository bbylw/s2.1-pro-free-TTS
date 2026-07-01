export type AudioFormat = "mp3" | "wav" | "opus";
export type LatencyMode = "normal" | "low";

export interface TTSParams {
  text: string;
  reference_id: string;
  format: AudioFormat;
  bitrate: number;
  speed: number;
  volume: number;
  latency: LatencyMode;
  model: string;
}

export interface HistoryItem {
  id: string;
  text: string;
  textPreview: string;
  audioUrl: string;
  duration: number;
  format: AudioFormat;
  createdAt: number;
  params: Partial<TTSParams>;
}

export type SynthStatus = "idle" | "synthesizing" | "success" | "error";

export interface HealthState {
  status: "unknown" | "checking" | "ok" | "fail";
  message: string;
}

/** 声音可见性 */
export type VoiceVisibility = "private" | "unlist" | "public";

/** 声音模型训练状态 */
export type VoiceState = "created" | "training" | "trained" | "failed";

/** Fish Audio 声音模型（克隆产物） */
export interface VoiceModel {
  _id: string;
  title: string;
  type?: string;
  state?: VoiceState;
  visibility?: VoiceVisibility;
  description?: string;
  cover_image?: string;
  train_mode?: "fast" | "full";
  languages?: string[];
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  task_count?: number;
  like_count?: number;
  samples?: Array<{ [k: string]: unknown }>;
}

/** 克隆请求参数 */
export interface CloneParams {
  title: string;
  description?: string;
  visibility: VoiceVisibility;
  texts: string[];
  tags: string[];
  enhance_audio_quality: boolean;
  generate_sample: boolean;
}

export type CloneStatus = "idle" | "uploading" | "success" | "error";

