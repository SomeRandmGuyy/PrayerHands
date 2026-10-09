<template>
  <main class="min-h-full bg-card px-4 py-4 text-ink">
    <p class="text-[11px] uppercase tracking-wide text-muted">Harness preview surface</p>
    <h1 class="mt-1 text-lg font-semibold">Monitor</h1>
    <p class="mt-1 max-w-md text-[12px] text-muted">
      This page is served by Gentle Fist for the browser pane and the device shells. It is not a device screenshot.
    </p>
    <div class="mt-4 grid max-w-md grid-cols-3 gap-2">
      <div class="rounded-md border border-line px-2 py-2">
        <p class="text-[11px] text-muted">Planner</p>
        <p class="font-medium text-fist-deep">waiting</p>
      </div>
      <div class="rounded-md border border-line px-2 py-2">
        <p class="text-[11px] text-muted">Editor</p>
        <p class="font-medium text-fist-deep">streaming</p>
      </div>
      <div class="rounded-md border border-line px-2 py-2">
        <p class="text-[11px] text-muted">Shell</p>
        <p class="font-medium text-fist-deep">idle</p>
      </div>
    </div>
  </main>
</template>
