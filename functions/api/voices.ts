/**
 * GET /api/voices?page_size=&page_number=&self=&title=
 * 列出声音模型（默认只列自己的）
 */
import { Env, FISH_AUDIO_BASE, authHeaders, errorResponse } from '../_lib'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.FISH_API_KEY) return errorResponse('服务器未配置 FISH_API_KEY', 500)

  const url = new URL(request.url)
  const params = new URLSearchParams({
    page_size: url.searchParams.get('page_size') || '20',
    page_number: url.searchParams.get('page_number') || '1',
    self: url.searchParams.get('self') ?? 'true',
  })
  const title = url.searchParams.get('title')
  if (title) params.set('title', title)

  const upstream = await fetch(`${FISH_AUDIO_BASE}/model?${params}`, {
    headers: authHeaders(env),
  })

  const raw = await upstream.text()
  if (!upstream.ok) {
    return errorResponse(`获取声音列表失败：${upstream.status} ${raw.slice(0, 500)}`, upstream.status)
  }

  return new Response(raw, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
