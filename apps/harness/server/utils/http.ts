export function httpUrl(input: string): URL | null {
  try {
    const url = new URL(input)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.username || url.password) return null
    return url
  } catch {
    return null
  }
}

export function isAllowedProbe(url: URL): boolean {
  const host = url.hostname.toLowerCase()
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true
  if (url.protocol !== 'https:') return false
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|169\.254\.|0\.0\.0\.0$)/.test(host)) return false
  return true
}

export async function probe(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number | null; detail: string }> {
  try {
    const response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(2500),
      redirect: 'manual',
    })
    return {
      ok: response.ok,
      status: response.status,
      detail: `HTTP ${response.status}`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'request failed'
    return { ok: false, status: null, detail: message }
  }
}
