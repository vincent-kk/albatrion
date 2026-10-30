// Diagnostic-only worker; the plain probe worker remains byte-for-byte unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Session } from 'node:inspector/promises';
import path from 'node:path';
import { PerformanceObserver, constants, performance } from 'node:perf_hooks';
import { setImmediate } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { digest, json } from '../b9-0/files.mjs';
import { runBlocks } from '../iv-3-0/helpers/runBlocks.mjs';
import { sanitizeProfile } from '../iv-3-0/helpers/sanitizeProfile.mjs';
import { setupOperation } from '../iv-3-0/helpers/setupOperation.mjs';
import { attributeNativeAllocations } from './helpers/attributeNativeAllocations.mjs';
import { summarizeAllocations } from './helpers/summarizeAllocations.mjs';

const [root, lane, mode] = process.argv.slice(2);
assert.equal(process.env.NODE_ENV, 'production');
assert.ok(['A', 'B'].includes(lane) && ['allocation', 'gc'].includes(mode));
const inputs = JSON.parse(
  fs.readFileSync(path.join(root, lane, 'inputs.json'), 'utf8'),
);
assert.equal(inputs.node, process.version);
assert.deepEqual(digest(path.join(root, lane, 'engine.mjs')), inputs.engine);
const engine = await import(
  pathToFileURL(path.join(root, lane, 'engine.mjs')).href
);
const operation = await setupOperation('switch-oneOf-80', engine);
await runBlocks(operation, 0, 2000);
const events = [];
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    const detail = Reflect.get(entry, 'detail');
    assert.ok(detail !== null && typeof detail === 'object');
    const kind = Reflect.get(detail, 'kind');
    const flags = Reflect.get(detail, 'flags');
    assert.ok(typeof kind === 'number' && typeof flags === 'number');
    events.push({
      startMs: entry.startTime,
      durationMs: entry.duration,
      kind,
      flags,
    });
  }
});
observer.observe({ entryTypes: ['gc'] });
const sampling = {
  samplingInterval: 32768,
  includeObjectsCollectedByMajorGC: true,
  includeObjectsCollectedByMinorGC: true,
};
const session = mode === 'allocation' ? new Session() : undefined;
session?.connect();
if (session) await session.post('HeapProfiler.startSampling', sampling);
const startMs = performance.now();
const blocks = await runBlocks(
  { run: () => operation.run(), check() {} },
  20000,
  0,
);
const endMs = performance.now();
let profile;
if (session) ({ profile } = await session.post('HeapProfiler.stopSampling'));
session?.disconnect();
await setImmediate();
await setImmediate();
observer.disconnect();
operation.check();
const gc = events.filter(
  (entry) => entry.startMs >= startMs && entry.startMs < endMs,
);
assert.ok(
  gc.length > 0,
  'A multi-gigabyte allocation run must report GC observations',
);
const counts = Object.fromEntries(
  [
    ['minor', constants.NODE_PERFORMANCE_GC_MINOR],
    ['major', constants.NODE_PERFORMANCE_GC_MAJOR],
    ['incremental', constants.NODE_PERFORMANCE_GC_INCREMENTAL],
    ['weakCallbacks', constants.NODE_PERFORMANCE_GC_WEAKCB],
  ].map(([name, kind]) => [
    name,
    gc.filter((entry) => entry.kind === kind).length,
  ]),
);
assert.equal(
  Object.values(counts).reduce((sum, value) => sum + value, 0),
  gc.length,
);
let allocations, attribution;
if (profile) {
  const nodes = [],
    pending = [profile.head];
  while (pending.length) {
    const node = pending.pop();
    nodes.push(node);
    pending.push(...node.children);
  }
  sanitizeProfile(
    { nodes },
    fs.realpathSync(
      fileURLToPath(new URL('../../../../../../../../', import.meta.url)),
    ),
    root,
  );
  allocations = summarizeAllocations(profile, 20000);
  attribution = attributeNativeAllocations(
    profile,
    20000,
    'prepared/' + lane + '/engine.mjs',
  );
}
json(path.join(root, 'diagnostic-' + lane + '-' + mode + '.json'), {
  row: 'switch-oneOf-80',
  lane,
  mode,
  node: process.version,
  pid: process.pid,
  warmups: 2000,
  operations: 20000,
  writesPerOperation: 2,
  startMs,
  endMs,
  blocks,
  sampling: session ? sampling : undefined,
  gc: { counts, events: gc },
  profile,
  allocations,
  attribution,
});
console.log('IV_4_GC_DIAGNOSTIC_OK ' + mode + ' ' + lane);
