/**
 * POST /api/tts
 * 透传至 https://api.fish.audio/v1/tts，流式回传音频
 * API Key 由 Pages 环境变量 FISH_API_KEY 注入
 */
import { Env, FISH_AUDIO_BASE, authHeaders, errorResponse } from '../_lib'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.FISH_API_KEY) return errorResponse('服务器未配置 FISH_API_KEY', 500)

  const reqBody = (await request.json()) as Record<string, unknown>

  const body: Record<string, unknown> = {
    text: reqBody.text,
    reference_id: reqBody.reference_id,
    format: reqBody.format || 'mp3',
    bitrate: reqBody.bitrate,
    speed: reqBody.speed,
    volume: reqBody.volume,
    latency: reqBody.latency || 'normal',
    chunk_length: reqBody.chunk_length,
    normalize: reqBody.normalize,
    enable_logging: reqBody.enable_logging ?? false,
  }

  // 移除空字段（reference_id 为空时上游会拒绝）
  Object.keys(body).forEach((k) => {
    const v = body[k]
    if (v === undefined || v === '' || v === null) delete body[k]
  })

  const upstream = await fetch(`${FISH_AUDIO_BASE}/v1/tts`, {
    method: 'POST',
    headers: {
      ...authHeaders(env),
      'Content-Type': 'application/json',
      model: (reqBody.model as string) || 's2.1-pro-free',
    },
    body: JSON.stringify(body),
  })

  if (!upstream.ok) {
    const errText = await upstream.text()
    return errorResponse(
      `Fish Audio 请求失败：${upstream.status} ${errText.slice(0, 500)}`,
      upstream.status,
    )
  }

  // 流式回传音频
  const contentType = upstream.headers.get('content-type') || 'audio/mpeg'
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    },
  })
}
