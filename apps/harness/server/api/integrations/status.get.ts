import { access } from 'node:fs/promises'
import { constants } from 'node:fs'
import { httpUrl, isAllowedProbe, probe } from '../../utils/http'

interface IntegrationReport {
  id: string
  connected: boolean
  label: string
  detail: string
}

async function hermesReport(): Promise<IntegrationReport> {
  const config = useRuntimeConfig()
  const base = String(config.hermesBaseUrl || '')
  const key = String(config.hermesApiKey || '')
  if (!base || !key) {
    return {
      id: 'agent.hermes',
      connected: false,
      label: 'not connected',
      detail: 'Set HERMES_API_BASE_URL and HERMES_API_SERVER_KEY. Hermes Agent exposes an OpenAI-compatible API (typically http://127.0.0.1:8642/v1) with bearer auth.',
    }
  }
  const url = httpUrl(base)
  if (!url || !isAllowedProbe(url)) {
    return {
      id: 'agent.hermes',
      connected: false,
      label: 'not connected',
      detail: 'HERMES_API_BASE_URL must be loopback http(s) or a public https URL.',
    }
  }
  const health = new URL('/health', url)
  const result = await probe(health.toString(), {
    headers: { Authorization: `Bearer ${key}` },
  })
  return {
    id: 'agent.hermes',
    connected: result.ok,
    label: result.ok ? 'connected' : 'not connected',
    detail: result.ok ? 'GET /health succeeded. Chat completions are not called from this page.' : `Health check failed (${result.detail}).`,
  }
}

async function primeReport(): Promise<IntegrationReport> {
  const bin = String(useRuntimeConfig().primeAgentBin || '')
  if (!bin) {
    return {
      id: 'agent.prime',
      connected: false,
      label: 'not connected',
      detail: 'Set PRIME_AGENT_BIN to an absolute path. Prime Agent speaks JSON-RPC on stdin/stdout (`prime-agent --mode rpc`). This harness does not spawn it.',
    }
  }
  if (!bin.startsWith('/') || bin.includes('..') || bin.includes('\0')) {
    return {
      id: 'agent.prime',
      connected: false,
      label: 'not connected',
      detail: 'PRIME_AGENT_BIN must be an absolute path without "..".',
    }
  }
  try {
    await access(bin, constants.X_OK)
  } catch {
    return {
      id: 'agent.prime',
      connected: false,
      label: 'not connected',
      detail: 'PRIME_AGENT_BIN is set, but that path is not an executable file.',
    }
  }
  return {
    id: 'agent.prime',
    connected: false,
    label: 'not connected',
    detail: 'Binary is present. An RPC session is not started.',
  }
}

function thesysReport(): IntegrationReport {
  const config = useRuntimeConfig()
  const key = String(config.thesysApiKey || '')
  const base = String(config.thesysBaseUrl || 'https://api.thesys.dev/v1/embed')
  if (!key) {
    return {
      id: 'agent.thesys',
      connected: false,
      label: 'not connected',
      detail: `Set THESYS_API_KEY. C1 is an OpenAI-compatible generative UI API at ${base}. No request is sent without a key, and none is sent automatically when a key exists.`,
    }
  }
  return {
    id: 'agent.thesys',
    connected: false,
    label: 'not connected',
    detail: 'THESYS_API_KEY is set. C1 has not been called. This UI will not invent a generative spec.',
  }
}

async function copilotReport(): Promise<IntegrationReport> {
  const urlValue = String(useRuntimeConfig().public.copilotkitRuntimeUrl || '')
  if (!urlValue) {
    return {
      id: 'agent.copilotkit',
      connected: false,
      label: 'not connected',
      detail: 'Set NUXT_PUBLIC_COPILOTKIT_RUNTIME_URL to a CopilotRuntime you host. CoAgents use the AG-UI protocol. @copilotkit/vue is not mounted here.',
    }
  }
  const url = httpUrl(urlValue)
  if (!url || !isAllowedProbe(url)) {
    return {
      id: 'agent.copilotkit',
      connected: false,
      label: 'not connected',
      detail: 'The CopilotKit runtime URL must be loopback http(s) or public https.',
    }
  }
  const result = await probe(url.toString())
  return {
    id: 'agent.copilotkit',
    connected: result.ok,
    label: result.ok ? 'runtime reachable' : 'not connected',
    detail: result.ok
      ? 'The runtime URL responded. This is not a signed-in CoAgent session.'
      : `Runtime probe failed (${result.detail}).`,
  }
}

async function openhandsReport(): Promise<IntegrationReport> {
  const base = String(useRuntimeConfig().public.openhandsBaseUrl || '')
  if (!base) {
    return {
      id: 'tool.openhands',
      connected: false,
      label: 'not connected',
      detail: 'Set NUXT_PUBLIC_OPENHANDS_BASE_URL or connect from the chat header. The agent loop stays in Python.',
    }
  }
  const url = httpUrl(base)
  if (!url || !isAllowedProbe(url)) {
    return {
      id: 'tool.openhands',
      connected: false,
      label: 'not connected',
      detail: 'OpenHands URL must be loopback http(s) or public https.',
    }
  }
  const health = new URL('/health', url)
  const result = await probe(health.toString())
  return {
    id: 'tool.openhands',
    connected: result.ok,
    label: result.ok ? 'HTTP reachable' : 'not connected',
    detail: result.ok ? 'GET /health succeeded. The event socket connects after you start a conversation.' : `Health check failed (${result.detail}).`,
  }
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const [hermes, prime, copilotkit, openhands] = await Promise.all([
    hermesReport(),
    primeReport(),
    copilotReport(),
    openhandsReport(),
  ])
  const integrations: IntegrationReport[] = [
    openhands,
    hermes,
    prime,
    thesysReport(),
    copilotkit,
  ]
  return {
    railwayTokenConfigured: Boolean(config.railwayToken),
    integrations,
  }
})
