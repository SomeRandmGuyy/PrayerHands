<script setup lang="ts">
import { cn } from '~/lib/cn'

const props = defineProps<{
  class?: string
  modelValue?: string
  placeholder?: string
  type?: string
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <input
    :type="type || 'text'"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="cn('h-8 w-full rounded-md border border-line bg-card px-2 text-[13px] text-ink outline-none placeholder:text-muted focus:border-fist', props.class)"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>
