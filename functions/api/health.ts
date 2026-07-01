/**
 * GET /api/health
 */
import { json } from '../_lib'

export const onRequestGet: PagesFunction = async () => {
  return json({ success: true, message: 'ok' })
}
