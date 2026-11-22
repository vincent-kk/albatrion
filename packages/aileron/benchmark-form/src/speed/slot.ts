import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { measureBatch } from './measureBatch';
import { provenance } from './provenance';
import { resolveArm } from './resolveArm';
import { rows } from './rows';

const [root, rowId, countText] = process.argv.slice(2);
const row: import('./rows').SpeedRow | undefined = rows.find(
  (item) => item.id === rowId,
);
if (!row) throw new Error(`Unknown row: ${rowId}`);
if (row.render) {
  const { setupJsdom } = await import('../utils/setup-env');
  setupJsdom();
}
const arm = await resolveArm(root, row.packagePath, row.packageName, row.entry);
const module = await import(pathToFileURL(arm.path).href);
const resolveDependency = createRequire(
  join(root, row.packagePath, 'package.json'),
);
const load = (name: string) =>
  import(pathToFileURL(resolveDependency.resolve(name)).href);
const batch = (count: number) =>
  measureBatch(count, () => row.prepare(module, load));
let count = Number(countText);
if (count === 0) {
  count = 128;
  while (
    (await batch(count)).elapsedNs < (row.targetBatchNs ?? 5_000_000) &&
    count < 16_777_216
  )
    count *= 2;
} else {
  for (let i = 0; i < (row.warmup ?? 10); i++) await batch(count);
  if (!globalThis.gc) throw new Error('GC is unavailable');
  globalThis.gc();
}
const measurements = [];
for (let i = 0; i < (countText === '0' ? 1 : (row.batches ?? 5)); i++)
  measurements.push(await batch(count));
const samples = measurements.map((item) => item.elapsedNs / count);
const observed = measurements[measurements.length - 1].observed;
const overheadStart = process.hrtime.bigint();
let sink = 0;
for (let i = 0; i < count; i++) sink += i;
const overhead = Number(process.hrtime.bigint() - overheadStart) / count;
process.stdout.write(
  JSON.stringify({
    arm,
    count,
    samples,
    observed,
    overhead,
    sink,
    provenance: provenance(
      [
        ...(globalThis as typeof globalThis & { [key: symbol]: Set<string> })[
          Symbol.for('speed.resolvedUrls')
        ],
      ],
      root,
    ),
  }),
);
