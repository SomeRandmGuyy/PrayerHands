<script setup lang="ts">
const harness = useHarness()
const { browserUrl } = harness
const draft = ref(browserUrl.value)

watch(browserUrl, (value) => {
  draft.value = value
})

function go() {
  harness.openBrowser(draft.value)
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col" data-testid="browser-pane">
    <form class="flex gap-1.5 border-b border-line px-2 py-1.5" @submit.prevent="go">
      <Input v-model="draft" placeholder="https:// or /sim/preview" class="font-mono" />
      <Button type="submit" variant="outline">Go</Button>
    </form>
    <p class="px-2 py-1 text-[11px] text-muted">iframe preview. Not a full browser engine. javascript: URLs are dropped.</p>
    <iframe :src="browserUrl" title="Browser preview" class="min-h-0 w-full flex-1 border-0 bg-white" />
  </div>
</template>
