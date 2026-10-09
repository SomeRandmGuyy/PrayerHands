import assert from 'node:assert/strict'
import { formatPatch, mapOpenHandsEvent } from '../app/lib/openhands/map-event.ts'
import { buildRailwaySpinPlan, existingRailwayDesktop, validateProjectName } from '../app/lib/railway.ts'

const user = mapOpenHandsEvent({
  id: 1,
  source: 'user',
  action: 'message',
  args: { content: 'hello', image_urls: [], file_urls: [] },
})
assert.equal(user.length, 1)
assert.equal(user[0]?.kind, 'user')
if (user[0]?.kind === 'user') assert.equal(user[0].text, 'hello')

const assistant = mapOpenHandsEvent({
  id: 2,
  source: 'agent',
  action: 'message',
  args: { content: 'working', thought: '' },
})
assert.equal(assistant[0]?.kind, 'assistant')

const run = mapOpenHandsEvent({
  id: 3,
  action: 'run',
  args: { command: 'pytest -q', hidden: false },
})
assert.equal(run[0]?.kind, 'artifact')
if (run[0]?.kind === 'artifact') {
  assert.equal(run[0].artifact.type, 'terminal')
  assert.equal(run[0].artifact.pluginId, 'card.terminal')
  if (run[0].artifact.type === 'terminal') assert.equal(run[0].artifact.payload.command, 'pytest -q')
}

const hidden = mapOpenHandsEvent({ id: 4, action: 'run', args: { command: 'secret', hidden: true } })
assert.equal(hidden.length, 0)

const output = mapOpenHandsEvent({
  id: 5,
  observation: 'run',
  content: '2 passed',
  extras: { command: 'pytest -q', metadata: { exit_code: 0 }, hidden: false },
})
if (output[0]?.kind === 'artifact' && output[0].artifact.type === 'terminal') {
  assert.equal(output[0].artifact.payload.exitCode, 0)
  assert.equal(output[0].artifact.payload.output, '2 passed')
}

const edit = mapOpenHandsEvent({
  id: 6,
  action: 'edit',
  args: { path: 'src/a.ts', old_str: 'a', new_str: 'b' },
})
if (edit[0]?.kind === 'artifact' && edit[0].artifact.type === 'diff') {
  assert.match(edit[0].artifact.payload.patch, /^- a/m)
  assert.match(edit[0].artifact.payload.patch, /^\+ b/m)
}

const browse = mapOpenHandsEvent({
  id: 7,
  observation: 'browse',
  content: 'visited',
  extras: { url: 'https://example.com', error: false, screenshot: 'data:image/png;base64,aaaa' },
})
if (browse[0]?.kind === 'artifact' && browse[0].artifact.type === 'browser') {
  assert.equal(browse[0].artifact.payload.url, 'https://example.com')
  assert.equal(browse[0].artifact.payload.screenshot, 'data:image/png;base64,aaaa')
}

const vm = mapOpenHandsEvent({
  id: 8,
  action: 'computer_use',
  args: { computer_action: 'screenshot', thought: 'look' },
})
if (vm[0]?.kind === 'artifact') assert.equal(vm[0].artifact.type, 'vm')

const huge = mapOpenHandsEvent({
  id: 9,
  observation: 'computer_use',
  content: 'shot',
  extras: { computer_action: 'screenshot', screenshot: `data:image/png;base64,${'a'.repeat(200_001)}` },
})
if (huge[0]?.kind === 'artifact' && huge[0].artifact.type === 'vm') {
  assert.equal(huge[0].artifact.payload.screenshot, undefined)
}

assert.equal(mapOpenHandsEvent({ action: 'recall', args: { query: 'x' } }).length, 0)
assert.equal(formatPatch({ content: 'line' }), '+ line')

const plan = buildRailwaySpinPlan('gentle-fist', 'notes')
assert.equal(plan.action, 'projectCreate')
assert.equal(plan.preserves.serviceId, existingRailwayDesktop.serviceId)
assert.equal(plan.preserves.projectId, existingRailwayDesktop.projectId)
assert.equal(plan.input.isPublic, false)
assert.equal(validateProjectName('ok name'), null)
assert.ok(validateProjectName(''))

console.log('map-event tests ok')
