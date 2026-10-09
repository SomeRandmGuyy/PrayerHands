<script setup lang="ts">
import { ref } from 'vue'
import type { Artifact } from '~/lib/openhands/map-event'
import { pluginForArtifact } from '~/lib/plugins/registry'

const props = defineProps<{ artifact: Artifact }>()
const harness = useHarness()
const { activePane } = harness
const steering = ref(false)
const note = ref('')

const plugin = computed(() => pluginForArtifact(props.artifact.type))
const originTone = computed(() => {
  if (props.artifact.origin === 'runtime') return 'live' as const
  if (props.artifact.origin === 'sample') return 'sample' as const
  return 'neutral' as const
})
const originLabel = computed(() => {
  if (props.artifact.origin === 'runtime') return 'Live'
  if (props.artifact.origin === 'sample') return 'Sample'
  return 'Local'
})

function submitSteer() {
  harness.steerArtifact(props.artifact.id, note.value)
  note.value = ''
  steering.value = false
}

function showVm() {
  activePane.value = 'vm'
}
</script>

<template>
  <article class="rounded-lg border border-line bg-card" :data-testid="`artifact-${artifact.type}`">
    <header class="flex items-center gap-2 border-b border-line px-2.5 py-1.5">
      <p class="min-w-0 flex-1 truncate font-medium">{{ artifact.title }}</p>
      <Badge :tone="originTone">{{ originLabel }}</Badge>
      <Badge v-if="artifact.status === 'accepted'" tone="live">Accepted</Badge>
      <Badge v-else-if="artifact.status === 'steered'" tone="warn">Steered</Badge>
      <Badge v-else-if="artifact.status === 'streaming'" tone="neutral">Streaming</Badge>
      <span class="text-[10px] text-muted">{{ plugin?.name }}</span>
    </header>

    <div v-if="artifact.type === 'diff'" class="px-2.5 py-2">
      <p class="mb-1 font-mono text-[11px] text-muted">{{ artifact.payload.path }}</p>
      <pre class="max-h-48 overflow-auto rounded-md bg-paper p-2 font-mono text-[12px] leading-5"><template v-for="(line, index) in artifact.payload.patch.split('\n')" :key="index"><span :class="line.startsWith('+') ? 'diff-add block' : line.startsWith('-') ? 'diff-del block' : 'block'">{{ line || ' ' }}</span></template></pre>
    </div>

    <div v-else-if="artifact.type === 'terminal'" class="px-2.5 py-2">
      <p class="font-mono text-[12px] text-fist-deep">$ {{ artifact.payload.command }}</p>
      <pre v-if="artifact.payload.output" class="mt-1 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[12px] text-ink">{{ artifact.payload.output }}</pre>
      <p v-if="artifact.payload.exitCode !== undefined" class="mt-1 text-[11px] text-muted">exit {{ artifact.payload.exitCode }}</p>
    </div>

    <div v-else-if="artifact.type === 'browser'" class="space-y-2 px-2.5 py-2">
      <p class="break-all font-mono text-[12px]">{{ artifact.payload.url }}</p>
      <p class="text-[12px] text-muted">{{ artifact.payload.detail }}</p>
      <img v-if="artifact.payload.screenshot" :src="artifact.payload.screenshot" alt="Browser screenshot from the Python runtime" class="max-h-40 rounded border border-line">
      <Button variant="outline" @click="harness.openBrowser(artifact.payload.url)">Open in browser pane</Button>
    </div>

    <div v-else-if="artifact.type === 'vm'" class="space-y-2 px-2.5 py-2">
      <p class="text-[12px]">{{ artifact.payload.action }} — {{ artifact.payload.detail }}</p>
      <img v-if="artifact.payload.screenshot" :src="artifact.payload.screenshot" alt="Desktop screenshot from computer use" class="max-h-40 rounded border border-line">
      <p v-else class="text-[12px] text-muted">Screenshot arrives on the computer_use observation. The desktop itself is the VM pane.</p>
      <Button variant="outline" @click="showVm">Show VM pane</Button>
    </div>

    <div v-else class="px-2.5 py-2">
      <p class="mb-2 text-[12px] text-muted">{{ artifact.payload.note }}</p>
      <div class="grid gap-1.5 sm:grid-cols-3">
        <div v-for="agent in artifact.payload.agents" :key="agent.name" class="rounded-md border border-line bg-paper px-2 py-1.5">
          <div class="flex items-center justify-between gap-2">
            <p class="font-medium">{{ agent.name }}</p>
            <Badge tone="neutral">{{ agent.state }}</Badge>
          </div>
          <p class="mt-1 truncate text-[11px] text-muted">{{ agent.last }}</p>
        </div>
      </div>
    </div>

    <footer class="flex flex-wrap items-center gap-1.5 border-t border-line px-2.5 py-1.5">
      <Button variant="outline" @click="harness.acceptArtifact(artifact.id)">Accept</Button>
      <Button variant="ghost" @click="steering = !steering">Steer</Button>
      <p class="text-[11px] text-muted">Accept marks the card in the harness. It does not pause the Python agent.</p>
    </footer>
    <form v-if="steering" class="flex gap-1.5 border-t border-line px-2.5 py-1.5" @submit.prevent="submitSteer">
      <Input v-model="note" placeholder="Steer this stream" class="flex-1" />
      <Button type="submit">Send steer</Button>
    </form>
    <p v-if="artifact.steerNote" class="border-t border-line px-2.5 py-1.5 text-[12px] text-muted">Steer: {{ artifact.steerNote }}</p>
  </article>
</template>
