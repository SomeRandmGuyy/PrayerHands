import { io, type Socket } from 'socket.io-client'
import { mapOpenHandsEvent, type Artifact, type ChatEntry } from '~/lib/openhands/map-event'
import { existingRailwayDesktop } from '~/lib/railway'
import { sampleMonitor, sampleSession, sampleTerminalLines } from '~/lib/sample-session'

export interface AgentProfile {
  id: string
  name: string
  summary: string
}

export const agentProfiles: AgentProfile[] = [
  {
    id: 'partner',
    name: 'Partner',
    summary: 'Codeact through the Python OpenHands loop. This is the default programming partner.',
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    summary: 'Same Python loop. The harness asks you to accept diff cards before treating them as kept.',
  },
  {
    id: 'monitor',
    name: 'Monitor',
    summary: 'Use this profile when you want a subagent dashboard. The dashboard is a card plugin, not a second agent runtime.',
  },
]

export interface OpenHandsLink {
  baseUrl: string
  status: 'not_connected' | 'checking' | 'http' | 'live'
  detail: string
  conversationId: string | null
  socket: 'idle' | 'connecting' | 'connected' | 'error'
}

export interface IntegrationReport {
  id: string
  connected: boolean
  label: string
  detail: string
}

export interface SpinResult {
  connected: boolean
  executed: boolean
  status: 'not_connected' | 'dry_run' | 'created' | 'error'
  message?: string
  project?: { id: string; name: string } | null
  plan: {
    action: string
    endpoint: string
    mutation: string
    input: { name: string; description: string; isPublic: false }
    preserves: { projectId: string; projectName: string; serviceId: string; note: string }
  }
}

export type DockPane = 'vm' | 'browser' | 'ios' | 'android'

let socket: Socket | null = null
let eventSeq = 0

function safeFrameUrl(input: string): string {
  if (input.startsWith('/') && !input.startsWith('//')) return input
  try {
    const url = new URL(input)
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.toString()
  } catch {
    /* keep the preview */
  }
  return '/sim/preview'
}

export function useHarness() {
  const config = useRuntimeConfig()
  const entries = useState<ChatEntry[]>('gf-entries', () => sampleSession())
  const terminalLines = useState<string[]>('gf-term', () => [...sampleTerminalLines])
  const railwayConnected = useState('gf-railway', () => false)
  const activePane = useState<DockPane>('gf-pane', () => 'vm')
  const activeProfileId = useState('gf-profile', () => 'partner')
  const activeProjectId = useState('gf-project', () => 'local')
  const explainOpen = useState('gf-explain', () => false)
  const browserUrl = useState('gf-browser', () => '/sim/preview')
  const integrations = useState<IntegrationReport[]>('gf-integrations', () => [])
  const railwayTokenConfigured = useState('gf-rail-token', () => false)
  const spinResult = useState<SpinResult | null>('gf-spin', () => null)
  const spinError = useState('gf-spin-error', () => '')
  const openhands = useState<OpenHandsLink>('gf-oh', () => ({
    baseUrl: config.public.openhandsBaseUrl || '',
    status: 'not_connected',
    detail: 'Python runtime not connected.',
    conversationId: null,
    socket: 'idle',
  }))

  const profile = computed(() => agentProfiles.find((item) => item.id === activeProfileId.value) ?? agentProfiles[0]!)
  const webtopUrl = computed(() => config.public.railwayWebtopUrl || existingRailwayDesktop.url)

  function pushTerminalLines(lines: string[]) {
    if (!lines.length) return
    terminalLines.value = [...terminalLines.value, ...lines]
  }

  function mirrorArtifact(artifact: Artifact) {
    if (artifact.type !== 'terminal' || artifact.origin === 'sample') return
    const lines = [`$ ${artifact.payload.command}`]
    if (artifact.payload.output) lines.push(...artifact.payload.output.split('\n'))
    pushTerminalLines(lines)
  }

  function append(next: ChatEntry[]) {
    entries.value = [...entries.value, ...next]
    for (const entry of next) {
      if (entry.kind === 'artifact') mirrorArtifact(entry.artifact)
    }
  }

  function patchArtifact(id: string, patch: Partial<Artifact> & { steerNote?: string }) {
    entries.value = entries.value.map((entry) => {
      if (entry.kind !== 'artifact' || entry.artifact.id !== id) return entry
      return { ...entry, artifact: { ...entry.artifact, ...patch } as Artifact }
    })
  }

  async function refreshIntegrations() {
    const data = await $fetch<unknown>('/api/integrations/status')
    // The desktop shell is a static client. Tauri answers unknown /api paths with index.html,
    // and assigning that body used to clear this list and unmount the side panel.
    if (!data || typeof data !== 'object' || !Array.isArray((data as { integrations?: unknown }).integrations)) return
    const body = data as { railwayTokenConfigured?: boolean; integrations: IntegrationReport[] }
    integrations.value = body.integrations
    railwayTokenConfigured.value = Boolean(body.railwayTokenConfigured)
  }

  function connectRailway() {
    railwayConnected.value = true
    activePane.value = 'vm'
  }

  function disconnectRailway() {
    railwayConnected.value = false
  }

  function disconnectOpenHands() {
    socket?.disconnect()
    socket = null
    openhands.value = {
      ...openhands.value,
      status: 'not_connected',
      socket: 'idle',
      conversationId: null,
      detail: 'Python runtime not connected.',
    }
  }

  async function connectOpenHands(baseUrl: string) {
    const base = baseUrl.trim().replace(/\/$/, '')
    openhands.value = {
      baseUrl: base,
      status: 'checking',
      detail: 'Probing /health on the server side…',
      conversationId: null,
      socket: 'idle',
    }
    try {
      const health = await $fetch<{ ok: boolean; detail: string }>('/api/openhands/probe', { query: { base } })
      if (!health.ok) {
        openhands.value = { ...openhands.value, status: 'not_connected', detail: health.detail }
        return
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Probe failed'
      openhands.value = { ...openhands.value, status: 'not_connected', detail: message }
      return
    }

    openhands.value = { ...openhands.value, status: 'http', detail: 'HTTP reachable. Creating a conversation…' }
    let conversationId = ''
    try {
      const created = await $fetch<{ status?: string; conversation_id?: string; message?: string }>(`${base}/api/conversations`, {
        method: 'POST',
        body: {},
      })
      if (!created.conversation_id) {
        openhands.value = {
          ...openhands.value,
          status: 'http',
          detail: created.message || 'HTTP is up. Conversation was not created (often missing LLM settings). Socket not attached.',
        }
        return
      }
      conversationId = created.conversation_id
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create a conversation'
      openhands.value = {
        ...openhands.value,
        status: 'http',
        detail: `${message}. HTTP health passed. The browser may be blocked by CORS, or the Python server rejected the session.`,
      }
      return
    }

    openhands.value = {
      ...openhands.value,
      conversationId,
      detail: 'Conversation created. Waiting until it is RUNNING…',
    }
    let sessionKey: string | null = null
    let running = false
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        const info = await $fetch<{ status?: string; session_api_key?: string | null }>(`${base}/api/conversations/${conversationId}`)
        sessionKey = info.session_api_key ?? null
        if (info.status === 'RUNNING') {
          running = true
          break
        }
        if (info.status === 'STOPPED') break
      } catch {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 750))
    }
    if (!running) {
      openhands.value = {
        ...openhands.value,
        status: 'http',
        socket: 'idle',
        detail: 'Conversation exists but is not RUNNING. The event socket was not attached. Check the Python server logs.',
      }
      return
    }

    socket?.disconnect()
    openhands.value = { ...openhands.value, socket: 'connecting', detail: 'Opening the event socket…' }
    socket = io(base, {
      transports: ['websocket'],
      path: '/socket.io',
      query: {
        conversation_id: conversationId,
        latest_event_id: -1,
        ...(sessionKey ? { session_api_key: sessionKey } : {}),
      },
    })
    socket.on('connect', () => {
      openhands.value = { ...openhands.value, status: 'live', socket: 'connected', detail: 'Event stream connected.' }
    })
    socket.on('oh_event', (event: unknown) => {
      append(mapOpenHandsEvent(event, eventSeq))
      eventSeq += 1
    })
    socket.on('connect_error', (error: Error) => {
      openhands.value = {
        ...openhands.value,
        status: 'http',
        socket: 'error',
        detail: `Socket failed: ${error.message}. HTTP is still reachable.`,
      }
    })
    socket.on('disconnect', () => {
      if (openhands.value.socket === 'connected') {
        openhands.value = { ...openhands.value, status: 'http', socket: 'idle', detail: 'Event socket disconnected.' }
      }
    })
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const id = `local-${Date.now()}`
    append([{ kind: 'user', id, origin: 'local', text: trimmed }])
    if (socket?.connected) {
      socket.emit('oh_user_action', {
        action: 'message',
        args: { content: trimmed, image_urls: [], file_urls: [] },
      })
      return
    }
    const follow: ChatEntry[] = [{
      kind: 'assistant',
      id: `${id}-note`,
      origin: 'local',
      text: 'The Python runtime is not connected, so this is not a model reply. Connect OpenHands to stream real artifacts.',
    }]
    if (/\b(dashboard|subagents?|monitor)\b/i.test(trimmed)) {
      const artifact = sampleMonitor()
      artifact.id = `sample-monitor-${Date.now()}`
      follow.push({
        kind: 'status',
        id: `${artifact.id}-label`,
        origin: 'local',
        text: 'Inserted the sample monitor card. It is not a live reading.',
      })
      follow.push({ kind: 'artifact', id: artifact.id, artifact })
    }
    append(follow)
  }

  function acceptArtifact(id: string) {
    patchArtifact(id, { status: 'accepted' })
  }

  function steerArtifact(id: string, note: string) {
    const trimmed = note.trim()
    if (!trimmed) return
    patchArtifact(id, { status: 'steered', steerNote: trimmed })
    if (socket?.connected) {
      socket.emit('oh_user_action', {
        action: 'message',
        args: { content: `Steer: ${trimmed}`, image_urls: [], file_urls: [] },
      })
      append([{
        kind: 'status',
        id: `steer-${id}`,
        origin: 'runtime',
        text: 'Steer sent to the Python agent as a user message. It does not pause the current action.',
      }])
      return
    }
    append([{
      kind: 'status',
      id: `steer-${id}`,
      origin: 'local',
      text: 'Steer kept on the card. The Python agent did not receive it.',
    }])
  }

  function showSampleDashboard() {
    const artifact = sampleMonitor()
    artifact.id = `sample-monitor-${Date.now()}`
    append([
      {
        kind: 'status',
        id: `${artifact.id}-label`,
        origin: 'local',
        text: 'Sample monitor. Live when the Python runtime exposes subagents.',
      },
      { kind: 'artifact', id: artifact.id, artifact },
    ])
  }

  function openBrowser(url: string) {
    browserUrl.value = safeFrameUrl(url)
    activePane.value = 'browser'
  }

  async function runSpin(name: string, execute: boolean) {
    spinError.value = ''
    try {
      const data = await $fetch<unknown>('/api/railway/spin', {
        method: 'POST',
        body: {
          name,
          execute,
          description: 'Created from the Gentle Fist harness',
        },
      })
      if (!data || typeof data !== 'object' || !('plan' in data)) {
        spinError.value = 'Spin hook is not available in this shell.'
        return
      }
      spinResult.value = data as SpinResult
    } catch (error) {
      spinResult.value = null
      spinError.value = error instanceof Error ? error.message : 'Spin hook failed'
    }
  }

  return {
    entries,
    terminalLines,
    railwayConnected,
    activePane,
    activeProfileId,
    activeProjectId,
    explainOpen,
    browserUrl,
    integrations,
    railwayTokenConfigured,
    spinResult,
    spinError,
    openhands,
    profile,
    webtopUrl,
    existingRailwayDesktop,
    refreshIntegrations,
    connectRailway,
    disconnectRailway,
    connectOpenHands,
    disconnectOpenHands,
    sendMessage,
    acceptArtifact,
    steerArtifact,
    showSampleDashboard,
    openBrowser,
    pushTerminalLines,
    runSpin,
  }
}
