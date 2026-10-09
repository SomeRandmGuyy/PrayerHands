<script setup lang="ts">
const harness = useHarness()

onMounted(() => {
  harness.refreshIntegrations().catch(() => {
    /* status route failure leaves plugins as not connected */
  })
})
</script>

<template>
  <div class="shell">
    <SidePanel class="shell-side" />
    <ChatColumn class="shell-chat" />
    <TerminalDock class="shell-term" />
    <Dock class="shell-dock" />
  </div>
</template>
