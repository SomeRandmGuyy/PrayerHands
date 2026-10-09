<script setup lang="ts">
import { Primitive } from 'reka-ui'
import { cn } from '~/lib/cn'
import { buttonVariants, type ButtonVariants } from './button-variants'

const props = withDefaults(defineProps<{
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}>(), {
  variant: 'default',
  size: 'sm',
  type: 'button',
  disabled: false,
})
</script>

<template>
  <Primitive
    as="button"
    :type="type"
    :disabled="disabled"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
