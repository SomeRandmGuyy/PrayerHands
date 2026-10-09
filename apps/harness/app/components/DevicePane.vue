<script setup lang="ts">
defineProps<{ platform: 'ios' | 'android' }>()
</script>

<template>
  <div class="flex h-full min-h-0 flex-col" :data-testid="`device-${platform}`">
    <p class="px-3 py-2 text-[12px] leading-5 text-muted">
      Visual shell only. No device farm, simulator binary, or device stream is attached. The screen shows the harness preview page so the frame has something to hold.
    </p>
    <div class="min-h-0 flex-1 overflow-auto">
      <div class="device" :class="platform === 'ios' ? 'device-ios' : 'device-android'">
        <div class="device-screen">
          <span v-if="platform === 'ios'" class="notch" />
          <span v-else class="punch" />
          <iframe src="/sim/preview" :title="`${platform} visual shell`" />
        </div>
      </div>
    </div>
  </div>
</template>
