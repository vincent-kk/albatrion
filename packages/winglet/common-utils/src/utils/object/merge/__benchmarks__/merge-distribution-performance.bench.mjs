// Loaded by package script bench:merge-distribution; native Node imports actual builds.
import { deepStrictEqual } from 'node:assert';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { cpus, release, totalmem } from 'node:os';
import { resolve } from 'node:path';

import { createMergePerformanceFixtures } from './merge-default-performance/createMergePerformanceFixtures.ts';
import { orderMergeFixtures } from './merge-default-performance/orderMergeFixtures.ts';
import { hashDistribution } from './merge-distribution-performance/hashDistribution.mjs';
import { loadMergeDistribution } from './merge-distribution-performance/loadMergeDistribution.mjs';
import { runMergeDistributionPair } from './merge-distribution-performance/runMergeDistributionPair.mjs';

const [baselineRoot, candidateRoot, repetitionText, outputPath] =
  process.argv.slice(2);
const repetition = Number(repetitionText);
if (
  !baselineRoot ||
  !candidateRoot ||
  !outputPath ||
  !Number.isInteger(repetition) ||
  repetition < 0 ||
  repetition > 7
)
  throw new Error(
    'Expected baselineRoot candidateRoot repetition(0..7) newOutputJson',
  );
if (existsSync(outputPath))
  throw new Error(`Refusing to overwrite evidence: ${outputPath}`);
const baseline = await loadMergeDistribution(baselineRoot);
const candidate = await loadMergeDistribution(candidateRoot);
const batchSize = 128;
const seed = (0x51a7e002 + repetition) >>> 0;
const afterFirst = [false, true, true, false][repetition % 4];
const formats = repetition % 2 === 0 ? ['esm', 'cjs'] : ['cjs', 'esm'];
const fixtures = orderMergeFixtures(createMergePerformanceFixtures(), seed);
const sink = { total: 0 };
const report = {
  complete: false,
  repetition,
  seed,
  batchSize,
  order: afterFirst ? 'after-before' : 'before-after',
  formats,
  fixtures: fixtures.map(({ name }) => name),
  environment: {
    node: process.version,
    v8: process.versions.v8,
    execPath: process.execPath,
    platform: process.platform,
    architecture: process.arch,
    osRelease: release(),
    cpu: cpus()[0].model,
    cpuCount: cpus().length,
    memoryBytes: totalmem(),
    rolldown: JSON.parse(
      readFileSync(
        resolve('../../../node_modules/rolldown/package.json'),
        'utf8',
      ),
    ).version,
    tinybench: JSON.parse(
      readFileSync(
        resolve('../../../node_modules/tinybench/package.json'),
        'utf8',
      ),
    ).version,
  },
  baseline: {
    root: baseline.root,
    version: baseline.version,
    entries: baseline.entries,
    hashes: baseline.hashes,
  },
  candidate: {
    root: candidate.root,
    version: candidate.version,
    entries: candidate.entries,
    hashes: candidate.hashes,
  },
  rows: [],
};
console.info(
  JSON.stringify({
    repetition,
    seed,
    order: report.order,
    formats,
    environment: report.environment,
  }),
);
for (const format of formats) {
  for (const fixture of fixtures) {
    const measurements = await runMergeDistributionPair(
      { baseline: baseline[format], candidate: candidate[format] },
      fixture,
      afterFirst,
      batchSize,
      sink,
    );
    const ratio =
      measurements.find(({ name }) => name === 'after').hz /
      measurements.find(({ name }) => name === 'before').hz;
    report.rows.push({ format, fixture: fixture.name, ratio, measurements });
    writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.info(
      JSON.stringify({ repetition, format, fixture: fixture.name, ratio }),
    );
  }
}
if (!Number.isFinite(sink.total) || sink.total <= 0)
  throw new Error('Results were not consumed');
deepStrictEqual(hashDistribution(baseline.root), baseline.hashes);
deepStrictEqual(hashDistribution(candidate.root), candidate.hashes);
report.complete = true;
report.sink = sink.total;
writeFileSync(outputPath, JSON.stringify(report, null, 2));
console.info(JSON.stringify({ repetition, complete: true, sink: sink.total }));
