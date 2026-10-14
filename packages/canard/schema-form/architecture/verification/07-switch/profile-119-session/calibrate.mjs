// CLI analysis of session empty calls; only derived calibration is transported for native writes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { directory, rawDirectory, HEAD, median, percentile, bootstrap, emitSummary as emit } from './runtime.mjs';
const stage = process.argv[2];
assert(['AA', '1b', '2'].includes(stage));
const files = fs.readdirSync(rawDirectory).filter(file => file.startsWith(stage + '-core-') && file.endsWith('.json'));
const records = files.map(file => JSON.parse(fs.readFileSync(path.join(rawDirectory, file), 'utf8')));
const byPasses = {};
for (const passes of [1, 2]) {
  const selected = records.filter(row => row.sentinelPasses === passes);
  if (!selected.length) continue;
  const rows = selected.flatMap(row => [...row.empty.before, ...row.empty.after]);
  const end = rows.map(row => row[1]), micro = rows.map(row => row[0]), wait = rows.map(row => row[1] - row[0]);
  const waitMedian = median(wait);
  byPasses[passes] = { passes, calls: rows.length, records: selected.length, C: median(end), M: median(micro),
    waitMedian, waitP5: percentile(wait, .05), waitP95: percentile(wait, .95),
    p95AbsoluteDeviationMs: percentile(wait.map(value => Math.abs(value - waitMedian)), .95),
    endBootstrap99: bootstrap(end, passes === 1 ? 9501 : 9511, 1000),
    microBootstrap99: bootstrap(micro, passes === 1 ? 9502 : 9512, 1000),
    sameConstantForBothVersions: true };
}
emit(`calibration-${stage}.json`, { HEAD, stage, files, byPasses });
console.log(`${stage}의 빈 호출 보정값을 집계했습니다.`);
