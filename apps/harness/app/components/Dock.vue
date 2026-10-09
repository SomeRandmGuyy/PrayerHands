<script setup lang="ts">
import { AppWindow, Globe, Smartphone } from '@lucide/vue'
import type { DockPane } from '~/composables/useHarness'

const harness = useHarness()
const { activePane, railwayConnected } = harness

const panes: { id: DockPane; label: string }[] = [
  { id: 'vm', label: 'VM' },
  { id: 'browser', label: 'Browser' },
  { id: 'ios', label: 'iOS' },
  { id: 'android', label: 'Android' },
]

function select(id: DockPane) {
  activePane.value = id
}
</script>

<template>
  <section class="panel flex h-full min-h-0 flex-col" data-testid="dock">
    <div class="flex items-center gap-1 border-b border-line px-2 py-1.5">
      <button
        v-for="pane in panes"
        :key="pane.id"
        type="button"
        class="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px]"
        :class="activePane === pane.id ? 'bg-mist font-medium text-ink' : 'text-muted hover:bg-paper'"
        @click="select(pane.id)"
      >
        <AppWindow v-if="pane.id === 'vm'" :size="13" />
        <Globe v-else-if="pane.id === 'browser'" :size="13" />
        <Smartphone v-else :size="13" />
        {{ pane.label }}
      </button>
      <button
        v-if="activePane === 'vm'"
        type="button"
        class="ml-auto text-[11px] text-fist-deep"
        @click="railwayConnected ? harness.disconnectRailway() : harness.connectRailway()"
      >
        {{ railwayConnected ? 'Disconnect embed' : 'Connect embed' }}
      </button>
    </div>
    <div class="min-h-0 flex-1 overflow-hidden p-2">
      <VmFrame v-if="activePane === 'vm'" />
      <BrowserPane v-else-if="activePane === 'browser'" />
      <DevicePane v-else-if="activePane === 'ios'" platform="ios" />
      <DevicePane v-else platform="android" />
    </div>
  </section>
</template>
