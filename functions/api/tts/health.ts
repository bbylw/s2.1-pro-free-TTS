/**
 * GET /api/tts/health
 * 用极短文本探测 API Key 是否可用
 */
import { Env, FISH_AUDIO_BASE, authHeaders, json } from '../../_lib'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.FISH_API_KEY) return json({ ok: false, message: '服务器未配置 FISH_API_KEY' })

  try {
    const upstream = await fetch(`${FISH_AUDIO_BASE}/v1/tts`, {
      method: 'POST',
      headers: {
        ...authHeaders(env),
        'Content-Type': 'application/json',
        model: 's2.1-pro-free',
      },
      body: JSON.stringify({ text: 'ok', format: 'mp3' }),
    })

    if (upstream.ok) return json({ ok: true, message: 'API Key 有效' })
    if (upstream.status === 401 || upstream.status === 403) {
      return json({ ok: false, message: `API Key 无效（${upstream.status}）` })
    }
    return json({ ok: true, message: `API Key 可用（上游返回 ${upstream.status}）` })
  } catch (e) {
    return json({ ok: false, message: e instanceof Error ? e.message : '检测失败' })
  }
}
