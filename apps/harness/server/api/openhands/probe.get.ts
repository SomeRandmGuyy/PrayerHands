import { httpUrl, isAllowedProbe, probe } from '../../utils/http'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const base = typeof query.base === 'string' ? query.base : ''
  const url = httpUrl(base)
  if (!url || !isAllowedProbe(url)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Base URL must be loopback http(s) or a public https origin, without credentials.',
    })
  }
  const health = await probe(new URL('/health', url).toString())
  return {
    ok: health.ok,
    status: health.status,
    detail: health.detail,
  }
})
