/**
 * POST /api/voices/clone
 * multipart 上传音频样本，转发至 https://api.fish.audio/model
 * 使用原生 formData() 解析 multipart，无需 multer
 */
import { Env, FISH_AUDIO_BASE, authHeaders, errorResponse } from '../../_lib'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.FISH_API_KEY) return errorResponse('服务器未配置 FISH_API_KEY', 500)

  const form = await request.formData()

  // 提取音频文件（FormDataEntryValue = File | string，只保留 File）
  // typeof File 在 workers runtime 与 workers-types 间存在差异，
  // 用 typeof 判断对象 + 是否有 name/type 属性更稳妥
  const allVoices = form.getAll('voices')
  const files: File[] = []
  for (const v of allVoices) {
    if (typeof v === 'object' && v !== null) {
      files.push(v as File)
    }
  }
  if (files.length === 0) return errorResponse('至少上传一个音频样本', 400)

  const title = (form.get('title') as string | null)?.trim()
  if (!title) return errorResponse('请填写声音标题', 400)

  // 构造转发给 Fish Audio 的 FormData
  const forwardForm = new FormData()
  forwardForm.append('type', 'tts')
  forwardForm.append('title', title)
  forwardForm.append('train_mode', 'fast')
  forwardForm.append('visibility', (form.get('visibility') as string) || 'private')
  forwardForm.append('enhance_audio_quality', (form.get('enhance_audio_quality') as string) || 'true')
  forwardForm.append('generate_sample', (form.get('generate_sample') as string) || 'false')

  const description = form.get('description') as string | null
  if (description) forwardForm.append('description', description)

  // 音频文件（File 可直接 append 到新 FormData）
  files.forEach((f) => forwardForm.append('voices', f, f.name || 'sample.wav'))

  // 对应文本 + 标签（多值字段）
  form.getAll('texts').forEach((t) => forwardForm.append('texts', t as string))
  form.getAll('tags').forEach((t) => forwardForm.append('tags', t as string))

  const upstream = await fetch(`${FISH_AUDIO_BASE}/model`, {
    method: 'POST',
    headers: authHeaders(env),
    body: forwardForm,
  })

  const raw = await upstream.text()
  if (!upstream.ok) {
    return errorResponse(`Fish Audio 克隆失败：${upstream.status} ${raw.slice(0, 500)}`, upstream.status)
  }

  return new Response(raw, {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}
