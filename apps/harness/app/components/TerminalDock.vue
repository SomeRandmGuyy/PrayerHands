<script setup lang="ts">
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

const harness = useHarness()
const { terminalLines } = harness
const host = ref<HTMLElement | null>(null)
let term: Terminal | null = null
let written = 0
let buffer = ''

function writeNew() {
  if (!term) return
  const pending = terminalLines.value.slice(written)
  for (const line of pending) term.writeln(line)
  written = terminalLines.value.length
}

onMounted(() => {
  if (!host.value) return
  term = new Terminal({
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 12,
    cursorBlink: true,
    convertEol: true,
    theme: {
      background: '#10241c',
      foreground: '#d5efe4',
      cursor: '#3dbe7a',
      selectionBackground: '#1f6b45',
    },
  })
  const fit = new FitAddon()
  term.loadAddon(fit)
  term.open(host.value)
  fit.fit()
  writeNew()
  const observer = new ResizeObserver(() => fit.fit())
  observer.observe(host.value)
  onUnmounted(() => observer.disconnect())

  term.onData((data) => {
    if (!term) return
    if (data === '\r') {
      term.write('\r\n')
      buffer = ''
      harness.pushTerminalLines(['local echo only — PTY is not attached'])
      return
    }
    if (data === '\u007f') {
      if (!buffer) return
      buffer = buffer.slice(0, -1)
      term.write('\b \b')
      return
    }
    if (data >= ' ') {
      buffer += data
      term.write(data)
    }
  })
})

watch(terminalLines, () => writeNew(), { deep: true })

onUnmounted(() => {
  term?.dispose()
  term = null
})
</script>

<template>
  <section class="panel flex h-full min-h-0 flex-col overflow-hidden bg-[#10241c]" data-testid="terminal">
    <header class="flex items-center justify-between border-b border-[#1d3b2e] px-2.5 py-1 text-[11px] text-[#b7d8c8]">
      <span>Terminal</span>
      <span>stub — not attached to the OpenHands PTY</span>
    </header>
    <div ref="host" class="xterm-host min-h-0 flex-1" />
  </section>
</template>
