<script setup lang="ts">
const harness = useHarness()
const { railwayConnected, webtopUrl } = harness
const clock = ref('')
let timer: ReturnType<typeof setInterval> | undefined

function tick() {
  clock.value = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date())
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 30_000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="vm-window" data-testid="vm-frame">
    <div class="vm-titlebar">
      <span class="traffic" aria-hidden="true">
        <i class="red" />
        <i class="yellow" />
        <i class="green" />
      </span>
      <span class="flex-1 text-center text-[12px] text-[#3a3a38]">Ubuntu — Railway</span>
    </div>
    <div class="vm-menubar">
      <strong class="font-semibold">Gentle Fist</strong>
      <span>File</span>
      <span>Edit</span>
      <span>View</span>
      <span>Window</span>
      <span>Help</span>
      <span class="ml-auto tabular-nums">{{ clock }}</span>
    </div>
    <div class="vm-stage">
      <iframe
        v-if="railwayConnected"
        :src="webtopUrl"
        title="Railway Ubuntu desktop"
        data-testid="webtop-frame"
        allow="clipboard-read; clipboard-write; fullscreen"
      />
      <div v-else class="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <GentleFistLogo :size="42" />
        <p class="font-medium">Desktop not connected</p>
        <p class="max-w-sm text-[12px] text-muted">
          Connect embeds the existing webtop at {{ webtopUrl }}. It does not change the Railway service, start command, or environment variables.
        </p>
        <Button @click="harness.connectRailway">Connect Railway</Button>
      </div>
    </div>
  </div>
</template>
