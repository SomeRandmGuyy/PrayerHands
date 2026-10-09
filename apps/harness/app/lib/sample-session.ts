import type { Artifact, ChatEntry } from './openhands/map-event'

export const sampleMonitor = (): Artifact => ({
  id: 'sample-monitor',
  type: 'subagent',
  pluginId: 'card.subagent',
  title: 'Subagent monitor',
  status: 'ready',
  origin: 'sample',
  payload: {
    mode: 'dashboard',
    note: 'Sample data. Live when the Python runtime exposes subagents. OpenHands does not stream this roster yet.',
    agents: [
      { name: 'Planner', state: 'waiting', last: 'Split the monitor into three cards' },
      { name: 'Editor', state: 'streaming', last: 'apps/monitor/board.ts' },
      { name: 'Shell', state: 'idle', last: 'pnpm typecheck' },
    ],
  },
})

export function sampleSession(): ChatEntry[] {
  const diff: Artifact = {
    id: 'sample-diff',
    type: 'diff',
    pluginId: 'card.diff',
    title: 'apps/monitor/board.ts',
    status: 'ready',
    origin: 'sample',
    payload: {
      path: 'apps/monitor/board.ts',
      thought: 'A small board the monitor card can render.',
      patch: [
        '- export const columns = ["agent"]',
        '+ export const columns = ["agent", "state", "last"]',
        '+',
        '+ export function boardTitle() {',
        '+   return "Subagent monitor"',
        '+ }',
      ].join('\n'),
    },
  }
  const terminal: Artifact = {
    id: 'sample-terminal',
    type: 'terminal',
    pluginId: 'card.terminal',
    title: 'Typecheck',
    status: 'ready',
    origin: 'sample',
    payload: {
      command: 'pnpm typecheck',
      output: 'apps/monitor/board.ts: ok\nDone in 1.2s',
      exitCode: 0,
    },
  }
  const browser: Artifact = {
    id: 'sample-browser',
    type: 'browser',
    pluginId: 'card.browser',
    title: '/sim/preview',
    status: 'ready',
    origin: 'sample',
    payload: {
      url: '/sim/preview',
      detail: 'Preview surface for the browser pane. Sample, not a live browse observation.',
    },
  }
  return [
    {
      kind: 'user',
      id: 'sample-user',
      origin: 'sample',
      text: 'Watch the coding agents and show me a monitoring dashboard.',
    },
    {
      kind: 'assistant',
      id: 'sample-assistant',
      origin: 'sample',
      text: 'The model streams the work. Each stream is an artifact card: a diff, a command, a preview. Source stays inside the card. This thread is a sample, so the cards below are not from the Python runtime.',
    },
    { kind: 'artifact', id: diff.id, artifact: diff },
    { kind: 'artifact', id: terminal.id, artifact: terminal },
    { kind: 'artifact', id: browser.id, artifact: browser },
    { kind: 'artifact', id: 'sample-monitor', artifact: sampleMonitor() },
  ]
}

export const sampleTerminalLines = [
  'gentle-fist terminal',
  'not attached to the OpenHands PTY — local echo only',
  '$ pnpm typecheck',
  'apps/monitor/board.ts: ok',
  'Done in 1.2s',
]
