/**
 * GET    /api/voices/:id   获取声音详情（用于轮询 state）
 * DELETE /api/voices/:id   删除声音模型
 */
import { Env, FISH_AUDIO_BASE, authHeaders, errorResponse } from '../../_lib'

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  if (!env.FISH_API_KEY) return errorResponse('服务器未配置 FISH_API_KEY', 500)
  const id = params.id as string

  const upstream = await fetch(`${FISH_AUDIO_BASE}/model/${id}`, {
    headers: authHeaders(env),
  })

  const raw = await upstream.text()
  if (!upstream.ok) {
    return errorResponse(`获取声音详情失败：${upstream.status} ${raw.slice(0, 500)}`, upstream.status)
  }

  return new Response(raw, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestDelete: PagesFunction<Env> = async ({ params, env }) => {
  if (!env.FISH_API_KEY) return errorResponse('服务器未配置 FISH_API_KEY', 500)
  const id = params.id as string

  const upstream = await fetch(`${FISH_AUDIO_BASE}/model/${id}`, {
    method: 'DELETE',
    headers: authHeaders(env),
  })

  if (!upstream.ok && upstream.status !== 204) {
    const raw = await upstream.text()
    return errorResponse(`删除声音失败：${upstream.status} ${raw.slice(0, 500)}`, upstream.status)
  }

  return new Response(null, { status: 204 })
}
