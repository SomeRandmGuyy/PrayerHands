import type { ArtifactType } from '../openhands/map-event'

export type PluginKind = 'card' | 'pane' | 'tool' | 'agent'

export interface HarnessPlugin {
  id: string
  name: string
  kind: PluginKind
  description: string
  artifactTypes?: ArtifactType[]
  /** Env vars the operator sets. Values are never rendered. */
  env: string[]
}

export const harnessPlugins: HarnessPlugin[] = [
  {
    id: 'card.diff',
    name: 'Diff card',
    kind: 'card',
    artifactTypes: ['diff'],
    env: [],
    description: 'Renders file read, write, and edit streams as a patch card.',
  },
  {
    id: 'card.terminal',
    name: 'Terminal card',
    kind: 'card',
    artifactTypes: ['terminal'],
    env: [],
    description: 'Renders command and IPython streams. Output is also mirrored into the bottom terminal.',
  },
  {
    id: 'card.browser',
    name: 'Browser card',
    kind: 'card',
    artifactTypes: ['browser'],
    env: [],
    description: 'Renders browse actions. Open sends the URL to the browser pane when it is http(s).',
  },
  {
    id: 'card.vm',
    name: 'Desktop card',
    kind: 'card',
    artifactTypes: ['vm'],
    env: [],
    description: 'Renders computer_use actions from the Python agent against the Railway desktop.',
  },
  {
    id: 'card.subagent',
    name: 'Subagent monitor',
    kind: 'card',
    artifactTypes: ['subagent'],
    env: [],
    description: 'Renders a delegate handoff, or the sample multi-agent dashboard.',
  },
  {
    id: 'pane.vm',
    name: 'Railway desktop',
    kind: 'pane',
    env: ['NUXT_PUBLIC_RAILWAY_WEBTOP_URL'],
    description: 'macOS-skinned frame around the existing Ubuntu webtop iframe.',
  },
  {
    id: 'pane.browser',
    name: 'Browser',
    kind: 'pane',
    env: [],
    description: 'iframe preview. Not a full browser engine.',
  },
  {
    id: 'pane.ios',
    name: 'iOS shell',
    kind: 'pane',
    env: [],
    description: 'Visual device frame. No device farm is attached.',
  },
  {
    id: 'pane.android',
    name: 'Android shell',
    kind: 'pane',
    env: [],
    description: 'Visual device frame. No device farm is attached.',
  },
  {
    id: 'pane.terminal',
    name: 'Terminal',
    kind: 'pane',
    env: [],
    description: 'xterm.js pane. Local echo only until a Python PTY is attached.',
  },
  {
    id: 'tool.openhands',
    name: 'OpenHands',
    kind: 'tool',
    env: ['NUXT_PUBLIC_OPENHANDS_BASE_URL'],
    description: 'Python agent loop in this repo. Socket.IO event oh_event, client action oh_user_action.',
  },
  {
    id: 'agent.hermes',
    name: 'Hermes Agent',
    kind: 'agent',
    env: ['HERMES_API_BASE_URL', 'HERMES_API_SERVER_KEY'],
    description: 'Nous Research agent. OpenAI-compatible API server, default http://127.0.0.1:8642/v1, bearer API_SERVER_KEY.',
  },
  {
    id: 'agent.prime',
    name: 'Prime Agent',
    kind: 'agent',
    env: ['PRIME_AGENT_BIN'],
    description: 'Prime Intellect coding agent. Headless JSON-RPC via `prime-agent --mode rpc`, or a TypeScript session. This harness does not spawn the process.',
  },
  {
    id: 'agent.thesys',
    name: 'Thesys C1',
    kind: 'agent',
    env: ['THESYS_API_KEY', 'THESYS_C1_BASE_URL'],
    description: 'Generative UI API at https://api.thesys.dev/v1/embed. OpenAI-compatible chat completions that return a C1 UI spec. The React renderer is not bundled here.',
  },
  {
    id: 'agent.copilotkit',
    name: 'CopilotKit CoAgents',
    kind: 'agent',
    env: ['NUXT_PUBLIC_COPILOTKIT_RUNTIME_URL'],
    description: 'CoAgents run on CopilotRuntime over AG-UI. Vue host package is @copilotkit/vue. Point this at a runtime you host. No model key is shipped.',
  },
]

export function pluginForArtifact(type: ArtifactType): HarnessPlugin | undefined {
  return harnessPlugins.find((plugin) => plugin.artifactTypes?.includes(type))
}

export function pluginsByKind(kind: PluginKind): HarnessPlugin[] {
  return harnessPlugins.filter((plugin) => plugin.kind === kind)
}
