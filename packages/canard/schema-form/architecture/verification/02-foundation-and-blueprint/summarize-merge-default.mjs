// Run with Node after both fixed eight-process series finish; stdout is the evidence JSON.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { cpus, release, totalmem } from 'node:os';

const directory = new URL('./', import.meta.url);
const BATCH_SIZE = 128;
const REPETITIONS = 8;
const T_CRITICAL = 2.364624251;
const phases = {};

for (const phase of ['paired', 'final']) {
  const fixtures = {};
  const provenance = [];
  for (let repetition = 0; repetition < REPETITIONS; repetition++) {
    const prefix = `merge-default-${phase}-${repetition}`;
    const report = JSON.parse(readFileSync(new URL(`${prefix}.json`, directory), 'utf8'));
    const records = readFileSync(new URL(`${prefix}.log`, directory), 'utf8').split('\n').flatMap((line) => {
      try { return [JSON.parse(line)]; } catch { return []; }
    });
    const metadata = records.find((record) => record.sourceHashes);
    if (metadata?.repetition !== repetition || metadata.batchSize !== BATCH_SIZE)
      throw new Error(`Unexpected process metadata: ${prefix}`);
    if (!records.some((record) => Number.isFinite(record.sink) && record.sink > 0))
      throw new Error(`Missing result consumption: ${prefix}`);
    provenance.push(metadata);
    for (const group of report.files[0].groups.filter((group) => group.fullName.includes(' primary '))) {
      const name = group.fullName.split(' — ')[1];
      const before = group.benchmarks.find((row) => row.name === 'before release branch');
      const after = group.benchmarks.find((row) => row.name === 'after public wrapper');
      if (!(before.hz > 0 && after.hz > 0)) throw new Error(`Invalid throughput: ${prefix}/${name}`);
      (fixtures[name] ??= []).push({ repetition, beforeCallsPerSecond: before.hz * BATCH_SIZE, afterCallsPerSecond: after.hz * BATCH_SIZE, ratio: after.hz / before.hz });
    }
  }
  const summaries = {};
  for (const [name, rows] of Object.entries(fixtures)) {
    if (rows.length !== REPETITIONS) throw new Error(`Incomplete fixture: ${phase}/${name}`);
    const logarithms = rows.map((row) => Math.log(row.ratio));
    const mean = logarithms.reduce((sum, value) => sum + value, 0) / REPETITIONS;
    const variance = logarithms.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (REPETITIONS - 1);
    const half = T_CRITICAL * Math.sqrt(variance / REPETITIONS);
    const confidenceInterval = [Math.exp(mean - half), Math.exp(mean + half)];
    summaries[name] = { rows, geometricMeanRatio: Math.exp(mean), logRatioMean: mean, logRatioSampleVariance: variance, confidenceInterval95: confidenceInterval, diagnosticCriterionMet: confidenceInterval[0] >= 1 };
  }
  const hashes = provenance.map(({ sourceHashes }) => JSON.stringify(sourceHashes));
  if (!hashes.every((hash) => hash === hashes[0])) throw new Error(`Source graph changed during ${phase}`);
  phases[phase] = { provenance, summaries };
}

const diagnostics = {};
for (const variant of ['getter', 'named']) {
  const report = JSON.parse(readFileSync(new URL(`merge-default-${variant}-diagnostic.json`, directory), 'utf8'));
  diagnostics[variant] = Object.fromEntries(report.files[0].groups.filter((group) => group.fullName.includes(' primary ')).map((group) => {
    const before = group.benchmarks.find((row) => row.name === 'before release branch');
    const after = group.benchmarks.find((row) => row.name === 'after public wrapper');
    return [group.fullName.split(' — ')[1], after.hz / before.hz];
  }));
}

const require = createRequire(import.meta.url);
console.log(JSON.stringify({
  scope: 'source-transpiled CommonJS diagnostic only; not distribution-performance evidence',
  productionLocalAliasesRemoved: true,
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, v8: process.versions.v8, platform: process.platform, architecture: process.arch, osRelease: release(), cpu: cpus()[0].model, cpuCount: cpus().length, memoryBytes: totalmem(), typescript: require('typescript').version, vitest: require('vitest/package.json').version },
  method: { batchSize: BATCH_SIZE, independentProcessPairs: REPETITIONS, tCriticalDegreesOfFreedom7: T_CRITICAL, confidence: 'two-sided 95% t interval on process-paired log throughput ratios' },
  phases,
  diagnostics,
}, null, 2));
