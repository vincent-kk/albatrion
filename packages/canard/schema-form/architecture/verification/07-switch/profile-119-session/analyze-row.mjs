// CLI row statistics; same-call endpoint pairing and later scheduler audits remain independent.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { directory, rawDirectory, HEAD, median, percentile, bootstrap, emitSummary as emit } from './runtime.mjs';
import { endpointDifference95c01 } from '../tools/endpointDifference95c01.mjs';
const [stage, fixture, validation] = process.argv.slice(2);
const count = 9;
const records = Array.from({ length: count }, (_, index) => JSON.parse(fs.readFileSync(
  path.join(rawDirectory, `${stage}-core-${fixture}-${validation}-r${index + 1}.json`), 'utf8')));
const cal = JSON.parse(fs.readFileSync(path.join(directory, `calibration-${stage}.json`), 'utf8')).byPasses[records[0].sentinelPasses];
const metrics = values => ({ median: median(values), p99: percentile(values, .99), samples: values.length });
const rows = [];
for (const mode of Object.keys(records[0].timing[records[0].versions[0]])) {
  const k = mode === 'update' ? records[0].interactionCount : mode === 'axis-update' ? 2 : 1;
  const versions = {}, selectedValues = {};
  for (const version of records[0].versions) {
    const old = version === '0.16.0';
    const runs = records.map(record => {
      const source = record.timing[version][mode];
      assert.equal(source.length, 101);
      const sentinel = source.map(row => row[1] - k * cal.C), micro = source.map(row => row[0] - k * cal.M);
      const sum = micro.map((value, index) => value + record.callbacks[version][mode][index]);
      const pairedSentinel = sentinel.map((value, index) => value - (source[index][2] - k * (cal.C - cal.M)));
      const expected = old ? sum : micro;
      const sentinelCI = bootstrap(sentinel, record.run * 100 + 95, 1000);
      const expectedCI = bootstrap(expected, record.run * 100 + 96, 1000);
      const noise = Math.max(.001, k * cal.p95AbsoluteDeviationMs + sentinelCI.halfWidth + expectedCI.halfWidth
        + k * (cal.endBootstrap99.halfWidth + cal.microBootstrap99.halfWidth));
      const difference = old ? median(sentinel) - median(expected) : endpointDifference95c01(pairedSentinel, expected);
      const boundary = record.boundary[version][mode];
      const zeroEngineMacrotasks = old || ['scheduled', 'executed', 'pendingAtMicrotasks', 'pendingAtSentinel', 'tailScheduled', 'tailExecuted']
        .every(key => boundary[key].max === 0);
      return { run: record.run, difference, noise, withinNoise: Math.abs(difference) <= noise,
        zeroEngineMacrotasks, values: { sentinel, micro, sum, pairedSentinel }, boundary: undefined };
    });
    const pooled = Object.fromEntries(['sentinel', 'micro', 'sum', 'pairedSentinel'].map(key => [key, runs.flatMap(run => run.values[key])]));
    const expected = old ? pooled.sum : pooled.micro;
    const sCI = bootstrap(pooled.sentinel, 9593, 1000), eCI = bootstrap(expected, 9594, 1000);
    const noise = Math.max(.001, k * cal.p95AbsoluteDeviationMs + sCI.halfWidth + eCI.halfWidth
      + k * (cal.endBootstrap99.halfWidth + cal.microBootstrap99.halfWidth));
    const difference = old ? median(pooled.sentinel) - median(expected) : endpointDifference95c01(pooled.pairedSentinel, expected);
    const withinNoise = Math.abs(difference) <= noise;
    const fallback = old && (!withinNoise || runs.some(run => !run.withinNoise));
    const selected = fallback ? 'sum' : 'sentinel';
    selectedValues[version] = pooled[selected];
    versions[version] = { metric: metrics(pooled[selected]), selected, fallback,
      sentinel: metrics(pooled.sentinel), micro: metrics(pooled.micro), sum: metrics(pooled.sum),
      endpointCheck: { difference, noise, withinNoise, passed: withinNoise && runs.every(run => run.withinNoise && run.zeroEngineMacrotasks),
        zeroEngineMacrotasks: runs.every(run => run.zeroEngineMacrotasks),
        runs: runs.map(run => ({ ...run, metric: metrics(run.values[selected]), values: undefined })) } };
  }
  const versionsList = records[0].versions;
  const deltas = selectedValues[versionsList[0]].map((value, index) => value - selectedValues[versionsList[1]][index]);
  rows.push({ fixture, validation, mode, callCount: k, versions, paired: bootstrap(deltas),
    runPairedMedians: Array.from({ length: count }, (_, index) => median(deltas.slice(index * 101, (index + 1) * 101))) });
}
emit(`analysis-${stage}-${fixture}-${validation}.json`, { HEAD, stage, fixture, validation, count, rows,
  calibration: `calibration-${stage}.json`, raw: records.map(record => `${stage}-core-${fixture}-${validation}-r${record.run}.json`) });
console.log(`${stage} ${fixture} ${validation}의 짝 차이와 종단 검증을 집계했습니다.`);
