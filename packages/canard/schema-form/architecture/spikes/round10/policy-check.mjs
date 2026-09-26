/** Independent value expectations for the two loser switches and clear priority. */
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import * as L from './proto/loop-v6.mjs';
import { buildSchema } from './proto/build-v6.mjs';
const results = [];
for (const [priority, fate, consumed, expected] of [
  ['inject-wins', 'dropped', true, 'I'], ['inject-wins', 'requeued', true, 'D'],
  ['derived-wins', 'dropped', true, 'D'], ['derived-wins', 'dropped', false, 'I'],
]) {
  L.setSwitches({ ...L.NEW_SWITCHES, EXPERIMENT: true, WRITE_CONFLICT: priority,
    LOSER_FATE: fate, EDGE_CONSUMED_ON_LOSS: consumed });
  const root = buildSchema({ type: 'object', properties: {
    a: { '&injectTo': { to: '/t', map: () => 'I' } }, b: {},
    t: { '&derived': { from: '/b', map: () => 'D' } },
  } }, { a: 1, b: 1, t: 'orig' });
  assert.equal(root.find('/t').raw, expected);
  assert.equal(root.settle.status, 'stable');
  results.push({ priority, fate, consumed, expected, actual: root.find('/t').raw, passed: true });
}
for (const priority of ['clear-wins', 'clear-loses']) {
  L.setSwitches({ ...L.NEW_SWITCHES, EXPERIMENT: true, WRITE_CONFLICT: 'derived-wins', CLEAR_PRIORITY: priority });
  const root = buildSchema({ type: 'object', properties: { b: {}, flag: {},
    t: { '&derived': { from: '/b', map: b => 'D:' + b }, '&clearValue': G => G.flag === true },
  } }, { b: 1, flag: false, t: 'orig' });
  L.batch(root, () => { L.write(root.find('/flag'), true); L.write(root.find('/b'), 2); });
  assert.equal(root.find('/t').raw, priority === 'clear-wins' ? undefined : 'D:2');
  results.push({ priority, actual: root.find('/t').raw ?? '<missing>', passed: true });
}
const result = { assertions: 10, cases: results };
writeFileSync(new URL('./policy-check-output.txt', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
