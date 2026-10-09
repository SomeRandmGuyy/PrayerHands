<script setup lang="ts">
import { cn } from '~/lib/cn'

const props = withDefaults(defineProps<{
  tone?: 'neutral' | 'live' | 'sample' | 'warn'
  class?: string
}>(), { tone: 'neutral' })

const tones: Record<string, string> = {
  neutral: 'bg-mist text-muted',
  live: 'bg-fist text-white',
  sample: 'bg-paper text-muted border border-line',
  warn: 'bg-[#fbf6e8] text-[#6b5420]',
}
</script>

<template>
  <span :class="cn('inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide', tones[tone], props.class)">
    <slot />
  </span>
</template>
