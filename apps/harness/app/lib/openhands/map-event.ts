export type ArtifactType = 'diff' | 'terminal' | 'browser' | 'vm' | 'subagent'

export type ArtifactOrigin = 'sample' | 'runtime' | 'local'

export type ArtifactStatus = 'streaming' | 'ready' | 'accepted' | 'steered'

export interface DiffPayload {
  path: string
  patch: string
  thought?: string
}

export interface TerminalPayload {
  command: string
  output: string
  exitCode?: number
}

export interface BrowserPayload {
  url: string
  detail: string
  screenshot?: string
}

export interface VmPayload {
  action: string
  detail: string
  screenshot?: string
}

export interface SubagentRow {
  name: string
  state: string
  last: string
}

export interface SubagentPayload {
  mode: 'delegate' | 'dashboard'
  agents: SubagentRow[]
  note: string
}

interface ArtifactBase {
  id: string
  pluginId: string
  title: string
  status: ArtifactStatus
  origin: ArtifactOrigin
  steerNote?: string
}

export type Artifact =
  | (ArtifactBase & { type: 'diff'; payload: DiffPayload })
  | (ArtifactBase & { type: 'terminal'; payload: TerminalPayload })
  | (ArtifactBase & { type: 'browser'; payload: BrowserPayload })
  | (ArtifactBase & { type: 'vm'; payload: VmPayload })
  | (ArtifactBase & { type: 'subagent'; payload: SubagentPayload })

export interface UserEntry {
  kind: 'user'
  id: string
  text: string
  origin: ArtifactOrigin
}

export interface AssistantEntry {
  kind: 'assistant'
  id: string
  text: string
  origin: ArtifactOrigin
}

export interface StatusEntry {
  kind: 'status'
  id: string
  text: string
  origin: ArtifactOrigin
}

export interface ArtifactEntry {
  kind: 'artifact'
  id: string
  artifact: Artifact
}

export type ChatEntry = UserEntry | AssistantEntry | StatusEntry | ArtifactEntry

const CLIP = 4000

export function clip(text: string, max = CLIP): string {
  if (text.length <= max) return text
  return `${text.slice(0, max)}\n… truncated`
}

export function formatPatch(input: {
  diff?: string
  oldStr?: string
  newStr?: string
  content?: string
}): string {
  if (input.diff && input.diff.trim()) return clip(input.diff)
  const oldStr = input.oldStr ?? ''
  const newStr = input.newStr ?? ''
  if (oldStr || newStr) {
    const minus = oldStr ? oldStr.split('\n').map((line) => `- ${line}`).join('\n') : ''
    const plus = newStr ? newStr.split('\n').map((line) => `+ ${line}`).join('\n') : ''
    return clip([minus, plus].filter(Boolean).join('\n'))
  }
  if (input.content) {
    return clip(input.content.split('\n').map((line) => `+ ${line}`).join('\n'))
  }
  return ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function num(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function imageSrc(value: unknown): string | undefined {
  const raw = str(value)
  if (!raw) return undefined
  if (raw.length > 200_000) return undefined
  if (raw.startsWith('data:image/')) return raw
  if (raw.startsWith('https://') || raw.startsWith('http://')) return raw
  return undefined
}

function entryId(event: Record<string, unknown>, seq: number, suffix: string): string {
  const id = event.id
  if (typeof id === 'number' || typeof id === 'string') return `oh-${id}-${suffix}`
  return `oh-${seq}-${suffix}`
}

export function mapOpenHandsEvent(event: unknown, seq = 0): ChatEntry[] {
  if (!isRecord(event)) return []
  const origin: ArtifactOrigin = 'runtime'
  const action = str(event.action)
  const observation = str(event.observation)
  const args = isRecord(event.args) ? event.args : {}
  const extras = isRecord(event.extras) ? event.extras : {}
  const source = str(event.source) ?? ''
  const content = str(event.content) ?? ''

  if (args.hidden === true || extras.hidden === true) return []
  if (action === 'null' || observation === 'null' || action === 'recall' || action === 'system' || action === 'start' || action === 'condense') {
    return []
  }

  if (action === 'message') {
    const text = str(args.content) || str(args.thought) || str(event.message) || ''
    if (!text.trim()) return []
    if (source === 'user') {
      return [{ kind: 'user', id: entryId(event, seq, 'user'), text, origin }]
    }
    return [{ kind: 'assistant', id: entryId(event, seq, 'assistant'), text, origin }]
  }

  if (action === 'think') {
    const text = str(args.thought) || ''
    if (!text.trim()) return []
    return [{ kind: 'assistant', id: entryId(event, seq, 'think'), text, origin }]
  }

  if (observation === 'agent_state_changed') {
    const state = str(extras.agent_state) || 'unknown'
    return [{ kind: 'status', id: entryId(event, seq, 'state'), text: `Agent state: ${state}`, origin }]
  }

  if (action === 'run' || action === 'run_ipython') {
    const command = action === 'run_ipython'
      ? str(args.code) || ''
      : str(args.command) || ''
    return [{
      kind: 'artifact',
      id: entryId(event, seq, 'term'),
      artifact: {
        id: entryId(event, seq, 'term'),
        type: 'terminal',
        pluginId: 'card.terminal',
        title: action === 'run_ipython' ? 'Python cell' : 'Command',
        status: 'streaming',
        origin,
        payload: { command: clip(command, 2000), output: '', exitCode: undefined },
      },
    }]
  }

  if (observation === 'run' || observation === 'run_ipython') {
    const metadata = isRecord(extras.metadata) ? extras.metadata : {}
    const command = str(extras.command) || str(extras.code) || ''
    return [{
      kind: 'artifact',
      id: entryId(event, seq, 'term-out'),
      artifact: {
        id: entryId(event, seq, 'term-out'),
        type: 'terminal',
        pluginId: 'card.terminal',
        title: observation === 'run_ipython' ? 'Python output' : 'Command output',
        status: 'ready',
        origin,
        payload: {
          command,
          output: clip(content),
          exitCode: num(metadata.exit_code),
        },
      },
    }]
  }

  if (action === 'edit' || action === 'write' || action === 'read') {
    const path = str(args.path) || 'file'
    const patch = formatPatch({
      oldStr: str(args.old_str),
      newStr: str(args.new_str),
      content: str(args.content) || str(args.file_text),
    })
    return [{
      kind: 'artifact',
      id: entryId(event, seq, 'diff'),
      artifact: {
        id: entryId(event, seq, 'diff'),
        type: 'diff',
        pluginId: 'card.diff',
        title: action === 'read' ? `Read ${path}` : path,
        status: action === 'read' ? 'ready' : 'streaming',
        origin,
        payload: {
          path,
          patch: patch || (action === 'read' ? '(waiting for file contents)' : '(empty edit)'),
          thought: str(args.thought),
        },
      },
    }]
  }

  if (observation === 'edit' || observation === 'write' || observation === 'read') {
    const path = str(extras.path) || 'file'
    const patch = formatPatch({
      diff: str(extras.diff),
      content: content || str(extras.new_content),
    })
    return [{
      kind: 'artifact',
      id: entryId(event, seq, 'diff-out'),
      artifact: {
        id: entryId(event, seq, 'diff-out'),
        type: 'diff',
        pluginId: 'card.diff',
        title: path,
        status: 'ready',
        origin,
        payload: { path, patch: patch || clip(content) || '(no diff text)' },
      },
    }]
  }

  if (action === 'browse' || action === 'browse_interactive') {
    const url = str(args.url) || 'browser'
    const detail = str(args.browser_actions) || str(args.thought) || 'Browser action'
    return [{
      kind: 'artifact',
      id: entryId(event, seq, 'browse'),
      artifact: {
        id: entryId(event, seq, 'browse'),
        type: 'browser',
        pluginId: 'card.browser',
        title: url,
        status: 'streaming',
        origin,
        payload: { url, detail: clip(detail, 1000) },
      },
    }]
  }

  if (observation === 'browse') {
    const url = str(extras.url) || 'page'
    const error = extras.error === true
    return [{
      kind: 'artifact',
      id: entryId(event, seq, 'browse-out'),
      artifact: {
        id: entryId(event, seq, 'browse-out'),
        type: 'browser',
        pluginId: 'card.browser',
        title: url,
        status: 'ready',
        origin,
        payload: {
          url,
          detail: clip(content || (error ? 'Browser reported an error.' : 'Page visited.')),
          screenshot: imageSrc(extras.screenshot),
        },
      },
    }]
  }

  if (action === 'computer_use') {
    const computerAction = str(args.computer_action) || 'computer'
    return [{
      kind: 'artifact',
      id: entryId(event, seq, 'vm'),
      artifact: {
        id: entryId(event, seq, 'vm'),
        type: 'vm',
        pluginId: 'card.vm',
        title: computerAction,
        status: 'streaming',
        origin,
        payload: {
          action: computerAction,
          detail: str(args.thought) || str(event.message) || computerAction,
        },
      },
    }]
  }

  if (observation === 'computer_use') {
    const computerAction = str(extras.computer_action) || 'computer'
    const error = extras.error === true
    return [{
      kind: 'artifact',
      id: entryId(event, seq, 'vm-out'),
      artifact: {
        id: entryId(event, seq, 'vm-out'),
        type: 'vm',
        pluginId: 'card.vm',
        title: computerAction,
        status: 'ready',
        origin,
        payload: {
          action: computerAction,
          detail: clip(content || (error ? 'Computer use reported an error.' : 'Desktop action finished.')),
          screenshot: imageSrc(extras.screenshot),
        },
      },
    }]
  }

  if (action === 'delegate') {
    const agent = str(args.agent) || 'agent'
    const inputs = isRecord(args.inputs) ? JSON.stringify(args.inputs) : ''
    return [{
      kind: 'artifact',
      id: entryId(event, seq, 'delegate'),
      artifact: {
        id: entryId(event, seq, 'delegate'),
        type: 'subagent',
        pluginId: 'card.subagent',
        title: `Delegate · ${agent}`,
        status: 'streaming',
        origin,
        payload: {
          mode: 'delegate',
          agents: [{ name: agent, state: 'delegated', last: clip(inputs || str(args.thought) || 'handoff', 240) }],
          note: 'OpenHands delegate is one handoff. It is not a multi-agent monitor. Live when this event arrives on the Python stream.',
        },
      },
    }]
  }

  if (observation === 'delegate') {
    return [{
      kind: 'artifact',
      id: entryId(event, seq, 'delegate-out'),
      artifact: {
        id: entryId(event, seq, 'delegate-out'),
        type: 'subagent',
        pluginId: 'card.subagent',
        title: 'Delegate result',
        status: 'ready',
        origin,
        payload: {
          mode: 'delegate',
          agents: [{ name: 'delegate', state: 'finished', last: clip(content, 240) }],
          note: 'Result from the Python delegate observation.',
        },
      },
    }]
  }

  return []
}
