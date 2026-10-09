<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 28 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    role="img"
    aria-label="Gentle Fist"
  >
    <rect width="64" height="64" rx="14" fill="#ffffff" />
    <rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="#d5e3db" />
    <g fill="#0e7a4b">
      <rect x="16" y="12" width="6.2" height="20" rx="3.1" />
      <rect x="24.4" y="8" width="6.2" height="24" rx="3.1" />
      <rect x="32.8" y="10" width="6.2" height="22" rx="3.1" />
      <rect x="41.2" y="15" width="6.2" height="17" rx="3.1" />
      <path d="M15 36c0-6 4-8 8-8h17c5 0 9 3 9 8v6c0 7-6 12-14 12H27c-7 0-12-4-12-10z" />
      <rect x="7" y="33" width="15" height="6.2" rx="3.1" transform="rotate(-38 14.5 36.1)" />
    </g>
  </svg>
</template>
