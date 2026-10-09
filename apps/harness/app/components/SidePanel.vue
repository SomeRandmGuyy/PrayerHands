<script setup lang="ts">
import { Folder, Bot, Puzzle } from '@lucide/vue'
import { agentProfiles } from '~/composables/useHarness'
import { pluginsByKind } from '~/lib/plugins/registry'

const harness = useHarness()
const {
  activeProjectId,
  activeProfileId,
  integrations,
  railwayConnected,
  railwayTokenConfigured,
  spinResult,
  spinError,
} = harness

const projectName = ref('gentle-fist-cloud')
const allowCreate = ref(false)

const projects = [
  { id: 'local', name: 'gentle-fist', detail: 'This repository' },
  { id: 'railway', name: 'precious-emotion', detail: 'desktop · production' },
]

function integration(id: string) {
  return integrations.value.find((item) => item.id === id)
}

function selectProject(id: string) {
  activeProjectId.value = id
  if (id === 'railway') harness.activePane.value = 'vm'
}

function selectProfile(id: string) {
  activeProfileId.value = id
}
</script>

<template>
  <aside class="panel flex h-full flex-col" data-testid="side-panel">
    <div class="flex items-center gap-2 border-b border-line px-3 py-2.5">
      <GentleFistLogo :size="26" />
      <div class="min-w-0">
        <p class="truncate text-[13px] font-semibold tracking-tight">Gentle Fist</p>
        <p class="text-[11px] text-muted">Ming</p>
      </div>
    </div>

    <div class="flex-1 space-y-4 overflow-auto px-3 py-3">
      <section>
        <p class="section-label mb-1.5 flex items-center gap-1"><Folder :size="12" /> Projects</p>
        <button
          v-for="project in projects"
          :key="project.id"
          type="button"
          class="mb-1 flex w-full flex-col rounded-md px-2 py-1.5 text-left hover:bg-mist"
          :class="activeProjectId === project.id ? 'bg-mist' : ''"
          @click="selectProject(project.id)"
        >
          <span class="font-medium">{{ project.name }}</span>
          <span class="text-[11px] text-muted">{{ project.detail }}</span>
        </button>
        <p class="mt-1 text-[11px] leading-4 text-muted">Local list only. It does not clone or deploy.</p>
        <div class="mt-2 space-y-1.5">
          <Input v-model="projectName" placeholder="New Railway project" />
          <div class="flex gap-1.5">
            <Button variant="outline" class="flex-1" @click="harness.runSpin(projectName, false)">Preview hook</Button>
            <Button class="flex-1" :disabled="!allowCreate" @click="harness.runSpin(projectName, true)">Create</Button>
          </div>
          <label class="flex items-start gap-1.5 text-[11px] leading-4 text-muted">
            <input v-model="allowCreate" type="checkbox" class="mt-0.5">
            <span>Create a new Railway project. This does not change precious-emotion or the desktop service.</span>
          </label>
          <p class="text-[11px] text-muted">
            Token: {{ railwayTokenConfigured ? 'configured' : 'not connected' }}
          </p>
          <p v-if="spinError" class="text-[11px] text-[#8a3d3d]">{{ spinError }}</p>
          <p v-if="spinResult" class="text-[11px] leading-4 text-muted" data-testid="spin-result">
            {{ spinResult.status }}. Preserves {{ spinResult.plan.preserves.projectName }} / {{ spinResult.plan.preserves.serviceId.slice(0, 8) }}.
            <template v-if="spinResult.project?.id"> New project {{ spinResult.project.id }}.</template>
            <template v-if="spinResult.message"> {{ spinResult.message }}</template>
          </p>
        </div>
      </section>

      <Separator />

      <section>
        <p class="section-label mb-1.5 flex items-center gap-1"><Bot :size="12" /> Agents</p>
        <button
          v-for="item in agentProfiles"
          :key="item.id"
          type="button"
          class="mb-1 w-full rounded-md px-2 py-1.5 text-left hover:bg-mist"
          :class="activeProfileId === item.id ? 'bg-mist' : ''"
          @click="selectProfile(item.id)"
        >
          <span class="block font-medium">{{ item.name }}</span>
          <span class="block text-[11px] leading-4 text-muted">{{ item.summary }}</span>
        </button>
      </section>

      <Separator />

      <section>
        <p class="section-label mb-1.5 flex items-center gap-1"><Puzzle :size="12" /> Plugins</p>
        <ul class="space-y-1.5">
          <li v-for="plugin in pluginsByKind('agent').concat(pluginsByKind('tool'))" :key="plugin.id">
            <div class="flex items-start justify-between gap-2">
              <p class="font-medium">{{ plugin.name }}</p>
              <Badge :tone="integration(plugin.id)?.connected ? 'live' : 'sample'">
                {{ integration(plugin.id)?.label || 'not connected' }}
              </Badge>
            </div>
            <p class="text-[11px] leading-4 text-muted">{{ integration(plugin.id)?.detail || plugin.description }}</p>
          </li>
        </ul>
        <p class="mt-2 text-[11px] text-muted">Cards and panes are plugins too: diff, terminal, browser, desktop, subagent monitor, device shells.</p>
      </section>
    </div>

    <div class="border-t border-line px-3 py-2 text-[11px] text-muted">
      Desktop embed: {{ railwayConnected ? 'connected' : 'not connected' }}
    </div>
  </aside>
</template>
