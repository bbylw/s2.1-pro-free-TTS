/**
 * Cloudflare Pages Functions 公共工具
 * 文件名以 _ 开头，不会被当作路由暴露
 */

export interface Env {
  FISH_API_KEY: string
}

export const FISH_AUDIO_BASE = 'https://api.fish.audio'

export function authHeaders(env: Env, extra: Record<string, string> = {}): Record<string, string> {
  return {
    Authorization: `Bearer ${env.FISH_API_KEY}`,
    ...extra,
  }
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function errorResponse(msg: string, status = 500): Response {
  return json({ error: msg }, status)
}
