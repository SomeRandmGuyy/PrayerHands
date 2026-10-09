<script setup lang="ts">
const harness = useHarness()
const { entries, explainOpen, openhands, profile } = harness
const draft = ref('')
const baseUrl = ref(openhands.value.baseUrl)

const log = ref<HTMLElement | null>(null)

watch(entries, async () => {
  await nextTick()
  if (log.value) log.value.scrollTop = log.value.scrollHeight
}, { deep: true })

function submit() {
  harness.sendMessage(draft.value)
  draft.value = ''
}

function toggleExplain() {
  explainOpen.value = !explainOpen.value
}

const placeholder = computed(() => {
  if (profile.value.id === 'monitor') return 'Ask for a monitoring dashboard of the coding agents'
  if (profile.value.id === 'reviewer') return 'Ask the partner to review. Diffs come back as cards.'
  return 'Ask the partner to change the project. Work comes back as artifacts.'
})
</script>

<template>
  <section class="panel flex h-full min-h-0 flex-col" data-testid="chat">
    <header class="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
      <div class="min-w-0 flex-1">
        <p class="font-medium">{{ profile.name }}</p>
        <p class="truncate text-[11px] text-muted">{{ openhands.detail }}</p>
      </div>
      <Badge :tone="openhands.status === 'live' ? 'live' : 'sample'" data-testid="runtime-status">
        {{ openhands.status === 'live' ? 'Live' : openhands.status === 'http' ? 'HTTP only' : 'Not connected' }}
      </Badge>
      <Button variant="ghost" @click="toggleExplain">How artifacts work</Button>
    </header>

    <div v-if="explainOpen" class="border-b border-line bg-mist/60 px-3 py-2 text-[12px] leading-5 text-ink" data-testid="artifact-explain">
      <p>
        A no-code coding bot that only emits artifacts still does the coding. The chat is not a transcript of source.
        The Python agent streams actions: edit a file, run a command, open a page, drive the desktop.
        This harness turns each action and its observation into an artifact card — a diff, a command, a preview, or a screenshot.
        You accept a card or steer it. The repository change is a byproduct of those cards.
      </p>
      <p class="mt-1 text-muted">
        The sample thread on the left of this log is labeled Sample. New prompts are not answered by a model until OpenHands is connected.
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-1.5 border-b border-line px-3 py-1.5">
      <Input v-model="baseUrl" placeholder="http://127.0.0.1:3000" class="max-w-xs" data-testid="openhands-url" />
      <Button @click="harness.connectOpenHands(baseUrl)">Connect Python</Button>
      <Button variant="outline" @click="harness.disconnectOpenHands">Disconnect</Button>
      <Button variant="ghost" @click="harness.showSampleDashboard">Sample monitor</Button>
    </div>

    <div ref="log" class="min-h-0 flex-1 space-y-2 overflow-auto px-3 py-3" data-testid="chat-log">
      <template v-for="entry in entries" :key="entry.id">
        <div v-if="entry.kind === 'user'" class="flex justify-end" data-testid="user-message">
          <p class="max-w-[40rem] rounded-md bg-mist px-2.5 py-1.5">{{ entry.text }}</p>
        </div>
        <p v-else-if="entry.kind === 'assistant'" class="max-w-[46rem] leading-5" data-testid="assistant-message">{{ entry.text }}</p>
        <p v-else-if="entry.kind === 'status'" class="text-[11px] text-muted">{{ entry.text }}</p>
        <ArtifactCard v-else :artifact="entry.artifact" />
      </template>
    </div>

    <form class="flex gap-1.5 border-t border-line px-3 py-2" data-testid="composer" @submit.prevent="submit">
      <Input v-model="draft" :placeholder="placeholder" data-testid="composer-input" />
      <Button type="submit">Send</Button>
    </form>
  </section>
</template>
