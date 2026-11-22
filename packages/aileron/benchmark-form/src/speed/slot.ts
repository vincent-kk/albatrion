import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

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
const prepared = row.prepare(module);
let result: unknown;
const batch = (count: number) => {
  const start = process.hrtime.bigint();
  for (let i = 0; i < count; i++) result = prepared.run();
  return Number(process.hrtime.bigint() - start);
};
let count = Number(countText);
if (count === 0) {
  count = 128;
  while (batch(count) < 5_000_000 && count < 16_777_216) count *= 2;
} else {
  for (let i = 0; i < 10; i++) batch(count);
  if (!globalThis.gc) throw new Error('GC is unavailable');
  globalThis.gc();
}
const samples = Array.from(
  { length: countText === '0' ? 1 : 5 },
  () => batch(count) / count,
);
if (!prepared.validate(result))
  throw new Error(`Unexpected result: ${String(result)}`);
const observed = result;
const overheadStart = process.hrtime.bigint();
for (let i = 0; i < count; i++) result = i;
const overhead = Number(process.hrtime.bigint() - overheadStart) / count;
prepared.cleanup();
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
