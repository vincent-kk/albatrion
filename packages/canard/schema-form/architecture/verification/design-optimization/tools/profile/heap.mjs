import fs from 'node:fs';
// usage: node --import ./register.mjs heap.mjs <scenario> [seconds] -> allocated bytes per operation by allocating function (sampling heap profiler, GC'd objects included)
import { Session } from 'node:inspector/promises';
import { performance } from 'node:perf_hooks';

import context from './context.mjs';
import { setup } from './fixtures.mjs';

const [scenario, secArg = '3'] = process.argv.slice(2);
const run = setup(scenario, 'current', {
  current: await import(new URL('current.mjs', context.engines)),
});
for (let i = 0; i < 10; i++) run();
const s = new Session();
s.connect();
await s.post('HeapProfiler.enable');
await s.post('HeapProfiler.startSampling', {
  samplingInterval: 4096,
  includeObjectsCollectedByMajorGC: true,
  includeObjectsCollectedByMinorGC: true,
});
const end = performance.now() + Number(secArg) * 1000;
let n = 0;
while (performance.now() < end) {
  run();
  n++;
}
const { profile } = await s.post('HeapProfiler.stopSampling');
s.disconnect();
fs.mkdirSync(new URL(`${scenario}/`, context.profiles), { recursive: true });
fs.writeFileSync(
  new URL(`${scenario}/allocation.heapprofile`, context.profiles),
  JSON.stringify({ scenario, ops: n, profile }),
);
const text = fs
  .readFileSync(new URL('current.mjs', context.engines), 'utf8')
  .split('\n');
const regions = [];
text.forEach((l, i) => {
  const m = l.match(/^\/\/#region (.*)$/);
  if (m) regions.push([i, m[1]]);
});
const regionOf = (line) => {
  let b = null;
  for (const r of regions) {
    if (r[0] <= line) b = r;
    else break;
  }
  return b ? b[1].replace(/^src\/core\//, '') : '';
};
const agg = new Map();
let total = 0;
const walk = (node) => {
  const f = node.callFrame;
  const k = `${f.functionName || '(anon)'}  ${f.url.endsWith('current.mjs') ? regionOf(f.lineNumber) : f.url.split('/').pop()}`;
  agg.set(k, (agg.get(k) ?? 0) + node.selfSize);
  total += node.selfSize;
  node.children.forEach(walk);
};
walk(profile.head);
console.log(
  `${scenario}: ops ${n}, allocated ${(total / n / 1024).toFixed(1)} KiB per op`,
);
for (const [k, v] of [...agg].sort((a, b) => b[1] - a[1]).slice(0, 10))
  console.log(
    `${((100 * v) / total).toFixed(1).padStart(5)}%  ${(v / n / 1024).toFixed(2).padStart(8)} KiB/op  ${k}`,
  );
