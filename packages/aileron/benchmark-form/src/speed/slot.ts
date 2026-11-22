import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

import { measureBatch } from './measureBatch';
import { resolveArm } from './resolveArm';
import { rows } from './rows';

const [root, rowId, countText] = process.argv.slice(2);
const row = rows.find((item) => item.id === rowId);
if (!row) throw new Error(`Unknown row: ${rowId}`);
if (row.render) {
  const { setupJsdom } = await import('../utils/setup-env');
  setupJsdom();
}
const arm = await resolveArm(root, row.packagePath, row.packageName, row.entry);
const module = await import(pathToFileURL(arm.path).href);
const batch = (count: number) => measureBatch(count, () => row.prepare(module));
let count = Number(countText);
if (count === 0) {
  count = 128;
  while ((await batch(count)).elapsedNs < 5_000_000 && count < 16_777_216)
    count *= 2;
} else {
  for (let i = 0; i < row.warmup; i++) await batch(count);
  if (!globalThis.gc) throw new Error('GC is unavailable');
  globalThis.gc();
}
const measurements = [];
for (let i = 0; i < (countText === '0' ? 1 : row.batches); i++)
  measurements.push(await batch(count));
const samples = measurements.map((item) => item.elapsedNs / count);
const observed = measurements[measurements.length - 1].observed;
let result: unknown;
const overheadStart = process.hrtime.bigint();
for (let i = 0; i < count; i++) result = i;
const overhead = Number(process.hrtime.bigint() - overheadStart) / count;
process.stdout.write(
  JSON.stringify({
    arm,
    count,
    samples,
    observed,
    overhead,
    commonjs: Object.keys(createRequire(import.meta.url).cache),
  }),
);
