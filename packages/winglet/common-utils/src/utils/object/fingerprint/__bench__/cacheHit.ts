import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';

import { stableSerialize } from '../../stableSerialize';
import { createFingerprintFactory } from '../index';

/** Isolates warmed immutable hits; run separately from compilation and test workers. */
const label = process.argv[2] ?? 'before';
const processId = Number(process.argv[3] ?? 0);
const rows: { fixture: string; phase: string; name: string; ns: number }[] = [];
let checksum = 0;
const batch = 100000;
for (const [fixture, value] of [
  ['small', { a: 1, b: 2 }],
  ['dense', Array.from({ length: 1000 }, (_, i) => i)],
] as const) {
  const next = createFingerprintFactory({ cache: 'immutable' });
  const candidates = [
    { name: 'legacy', run: () => stableSerialize(value) },
    { name: 'factory', run: () => next(value) },
  ];
  for (const candidate of candidates)
    for (let i = 0; i < batch; i++) checksum += candidate.run().length;
  for (const phase of ['generate', 'lookup']) {
    const maps = candidates.map((c) => new Map([[c.run(), 1]]));
    for (let sample = 0; sample < 30; sample++) {
      const order = (sample + processId) % 2 ? [1, 0] : [0, 1];
      for (const index of order) {
        const { run, name } = candidates[index];
        const map = maps[index];
        let consumed = 0;
        const start = performance.now();
        if (phase === 'generate')
          for (let i = 0; i < batch; i++) consumed += run().length;
        else for (let i = 0; i < batch; i++) consumed += map.get(run()) ?? 0;
        rows.push({
          fixture,
          phase,
          name,
          ns: ((performance.now() - start) * 1e6) / batch,
        });
        checksum = (checksum + consumed) >>> 0;
      }
    }
  }
}
const source = readFileSync(
  'packages/winglet/common-utils/src/utils/object/fingerprint/createFingerprintFactory.ts',
);
const directory = '.seiri/tasks/fingerprint-cache-review';
mkdirSync(directory, { recursive: true });
writeFileSync(
  `${directory}/${label}-${processId}.json`,
  JSON.stringify({
    node: process.version,
    processId,
    batch,
    checksum,
    sourceHash: createHash('sha256').update(source).digest('hex'),
    rows,
  }),
);
console.log(label, processId, checksum);
