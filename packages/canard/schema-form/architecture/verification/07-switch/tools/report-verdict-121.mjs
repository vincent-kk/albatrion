/*
 * 사용법(stage-07 루트):
 *   node <이 파일> --smoke /지정/bundles/core-121-smoke.json
 *   node <이 파일> --input-dir=/원자료/디렉터리 --transport
 *   node <이 파일> --input-dir=/원자료/디렉터리 --check
 *   node <이 파일> --pair /지정/f4/pair-AA.json
 * --smoke 입력은 measure-verdict-121의 stdout JSON 객체 또는 객체 배열입니다.
 * --pair 입력은 measure-verdict-121 --pair의 stdout 객체, measure-core-pair-126의 { workers: [...] } 기록, 또는 그 배열이며, 행마다 새 A/A 크기를
 * 119 세션의 같은 번들 A/A 크기 옆에 적습니다. gc 없는 첫 쓰기 열은 기록 전용입니다.
 * 소량 표본은 공식 성능 판정을 내리지 않으며 (가)의 수치·경계 결과를 표시합니다.
 * 공식 입력은 verdict-121-summary.json 및 timingFile 파일, 세 회차·101표본입니다.
 * 결과는 stdout으로만 내보냅니다. 이전 93 판정 자료는 verification 디렉터리에서 읽습니다.
 */
// CLI report: derives official rows from timing-only files; emits artifacts for native writes.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { endpointDifference95c01 } from './endpointDifference95c01.mjs';

const metric = values => {
  const sorted = values.toSorted((a, b) => a - b);
  assert(sorted.length && sorted.every(Number.isFinite));
  return { median: sorted[Math.ceil(sorted.length * .5) - 1], p99: sorted[Math.ceil(sorted.length * .99) - 1], samples: sorted.length };
};
const percentile = (values, proportion) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * proportion) - 1];

/** Apply (ga) to paired endpoint/microtask arrays and all separately observed scheduling boundaries. */
export function validationA121(pairedSentinel, microtask, noiseMs, orders) {
  assert(pairedSentinel.length > 0 && pairedSentinel.length === microtask.length);
  assert(Number.isFinite(noiseMs) && noiseMs >= .001);
  assert(orders.length > 0, 'Boundary evidence is required for (ga)');
  const differenceMs = endpointDifference95c01(pairedSentinel, microtask);
  const zeroEngineMacrotasks = orders.every(order => ['scheduled', 'executed', 'pendingAtMicrotasks',
    'pendingAtSentinel', 'tailScheduled', 'tailExecuted'].every(key => order[key].p99 === 0));
  const withinNoise = Math.abs(differenceMs) <= noiseMs;
  return { differenceMs, noiseMs, withinNoise, zeroEngineMacrotasks, passed: withinNoise && zeroEngineMacrotasks };
}

/** Session 119's pooled paired-median bootstrap (xorshift, 1999 trials), kept so both A/A magnitudes share one statistic. */
function pairedBootstrap(values, seed = 101, trials = 1999) {
  let state = seed >>> 0;
  const medians = [];
  for (let repeat = 0; repeat < trials; repeat++) {
    const sample = [];
    for (let index = 0; index < values.length; index++) {
      state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
      sample.push(values[(state >>> 0) % values.length]);
    }
    medians.push(percentile(sample, .5));
  }
  const center = percentile(values, .5), low = percentile(medians, .005), high = percentile(medians, .995);
  return { median: center, low, high, halfWidth: Math.max(center - low, high - center), trials, seed };
}

/**
 * Pool paired base-minus-candidate end-to-end differences per row and set them beside session 119's A/A.
 * The fixed empty-call constant is the same for both members of a pair, so it cancels in each difference.
 * @param workers - measure-verdict-121 --pair outputs of one stage, any number of runs
 * @param verification - 07-switch directory holding profile-119-session/analysis-AA-*.json
 * @returns One row per fixture/validation/mode, verdict columns and no-GC record columns alike
 */
export function pairRows121(workers, verification) {
  assert(workers.length > 0 && workers.every(worker => worker.summary.stage === workers[0].summary.stage));
  const groups = new Map();
  for (const worker of workers) {
    const { summary, timings } = worker;
    assert.equal(summary.postGcDiscardedPairs, 1);
    assert.equal(summary.sameCompiledSource, false, 'A pair must compare byte-different sources');
    for (const mode of [...summary.verdictColumns, ...summary.recordColumns]) {
      const key = `${summary.fixture}/${summary.validation}/${mode}`;
      const group = groups.get(key) ?? { fixture: summary.fixture, validation: summary.validation, mode,
        record: summary.recordColumns.includes(mode), deltas: [], runs: [] };
      const base = timings.base[mode], candidate = timings.candidate[mode];
      assert(base.length === candidate.length && base.length === summary.sampleCount);
      const deltas = base.map((row, index) => row[1] - candidate[index][1]);
      group.deltas.push(...deltas);
      group.runs.push({ run: summary.run, median: percentile(deltas, .5), samples: deltas.length });
      groups.set(key, group);
    }
  }
  return [...groups.values()].map(group => {
    const paired = pairedBootstrap(group.deltas);
    const source = path.join(verification, `profile-119-session/analysis-AA-${group.fixture}-${group.validation}.json`);
    const sameBundle = !group.record && fs.existsSync(source)
      ? JSON.parse(fs.readFileSync(source, 'utf8')).rows.find(row => row.mode === group.mode)?.paired : undefined;
    return { fixture: group.fixture, validation: group.validation, mode: group.mode,
      column: group.record ? 'record (no forced gc)' : 'verdict (forced gc)', samples: group.deltas.length,
      newAAms: Math.abs(paired.median), newPaired: paired, runs: group.runs,
      sameBundleAAms: sameBundle ? Math.abs(sameBundle.median) : null,
      sameBundleSource: sameBundle ? path.relative(verification, source) : null };
  });
}

/** Seeded resampling estimates the median's 99% interval without external packages; measure-core-pair-126 reuses it for (ga). */
export function bootstrap(values, seed) {
  let state = seed >>> 0;
  const estimates = [];
  for (let repeat = 0; repeat < 1000; repeat++) {
    const sample = [];
    for (let index = 0; index < values.length; index++) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      sample.push(values[Math.floor(state / 4294967296 * values.length)]);
    }
    estimates.push(metric(sample).median);
  }
  const median = metric(values).median, low = percentile(estimates, .005), high = percentile(estimates, .995);
  return { low, high, halfWidth: Math.max(median - low, high - median), resamples: 1000, seed };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
const verification = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.argv.find(value => value.startsWith('--input-dir='))?.slice(12) ?? verification;
const repo = path.resolve(verification, '../../../../../..');
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
const hash = value => createHash('sha256').update(value).digest('hex');
if (process.argv.includes('--smoke')) {
  const filename = process.argv[process.argv.indexOf('--smoke') + 1];
  const input = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const workers = Array.isArray(input) ? input : [input];
  const rows = [];
  for (const { timings, summary: record } of workers) {
    assert.equal(record.postGcDiscardedPairs, 1, 'Fresh post-GC discard samples are required');
    assert.equal(record.boundaryWrapperInstalledAfterOfficialSamples, true);
    assert.equal(record.officialEngineInstrumentation, false);
    assert(record.serviceExits.every(exit => exit.code === 0 && exit.signal === null));
    const controls = [...timings['empty-before'], ...timings['empty-after']];
    const emptyEnd = metric(controls.map(row => row[1])), emptyMicro = metric(controls.map(row => row[0]));
    const waiting = controls.map(row => row[1] - row[0]), waitMedian = metric(waiting).median;
    const emptyNoise = percentile(waiting.map(value => Math.abs(value - waitMedian)), .95);
    const emptyEndCi = bootstrap(controls.map(row => row[1]), 9501), emptyMicroCi = bootstrap(controls.map(row => row[0]), 9502);
    for (const [mode, order] of Object.entries(record.ordering)) {
      assert.equal(order.pendingAtSentinel.p99, 0);
      assert.equal(order.tailScheduled.p99 + order.tailExecuted.p99, 0);
      if (record.version !== 'new') continue;
      const callCount = mode === 'update' ? record.interactionCount : mode === 'axis-update' ? 2 : 1;
      const samples = timings[mode];
      assert.equal(samples.length, record.sampleCount);
      assert(samples.every(row => row.length === 3 && row.every(Number.isFinite)));
      const sentinel = samples.map(row => row[1] - callCount * emptyEnd.median);
      const microtask = samples.map(row => row[0] - callCount * emptyMicro.median);
      const paired = sentinel.map((value, index) => value - (samples[index][2] - callCount * (emptyEnd.median - emptyMicro.median)));
      const sentinelCi = bootstrap(sentinel, record.run * 100 + 95), expectedCi = bootstrap(microtask, record.run * 100 + 96);
      const noise = Math.max(.001, callCount * emptyNoise + sentinelCi.halfWidth + expectedCi.halfWidth +
        callCount * (emptyEndCi.halfWidth + emptyMicroCi.halfWidth));
      rows.push({ fixture: record.fixture, validation: record.validation, mode,
        ...validationA121(paired, microtask, noise, [order]) });
    }
  }
  assert(rows.length > 0, 'Smoke input must include a new-engine worker');
  console.log(JSON.stringify({ smoke: true, officialVerdict: false, rows }));
  console.log(`SMOKE_REPORT_121_OK: ${workers.length} workers; (ga) ${rows.filter(row => row.passed).length}/${rows.length}; boundary ${rows.filter(row => row.zeroEngineMacrotasks).length}/${rows.length}`);
} else if (process.argv.includes('--pair')) {
  const input = JSON.parse(fs.readFileSync(process.argv[process.argv.indexOf('--pair') + 1], 'utf8'));
  // measure-core-pair-126 saves `{ workers: [...] }`; measure-verdict-121 --pair prints top-level summary/timings.
  const workers = (Array.isArray(input) ? input : [input]).flatMap(item => Array.isArray(item.workers) ? item.workers : [item]);
  const rows = pairRows121(workers, verification);
  const us = value => value === null ? '—' : (value * 1000).toFixed(3);
  const lines = rows.map(row => `| ${row.fixture} | ${row.validation} | ${row.mode} | ${row.column} | ${us(row.newAAms)} [${us(row.newPaired.low)}, ${us(row.newPaired.high)}] | ${us(row.sameBundleAAms)} |`);
  const smoke = workers.some(worker => worker.summary.sampleCount < 100);
  console.log(JSON.stringify({ pair: true, stage: workers[0].summary.stage, smoke, officialVerdict: false, rows,
    markdown: ['| 픽스처 | 검증 | 작업 | 열 | 새 A/A 크기 µs [99% 구간] | 119 같은 번들 A/A 크기 µs |',
      '| --- | --- | --- | --- | ---: | ---: |', ...lines].join('\n') }));
  console.log(`PAIR_REPORT_121_OK: ${workers.length} workers; ${rows.length} rows; ${rows.filter(row => row.sameBundleAAms !== null).length} with a session-119 same-bundle A/A`);
} else {
const manifest = JSON.parse(fs.readFileSync(path.join(output, 'verdict-121-summary.json'), 'utf8'));
const previous = JSON.parse(fs.readFileSync(path.join(verification, 'verdict-93c01-summary.json'), 'utf8'));
const records = manifest.records;
const counts = rows => ({ rows: rows.length, met: rows.filter(row => row.verdict !== '미달').length,
  missed: rows.filter(row => row.verdict === '미달').length, ties: rows.filter(row => row.tie).length,
  metRows: rows.filter(row => row.verdict !== '미달').map(row => `${row.fixture}/${row.mode}`),
  missedRows: rows.filter(row => row.verdict === '미달').map(row => `${row.fixture}/${row.mode}`) });
const timingOnly = value => typeof value === 'number' ? Number.isFinite(value) :
  value !== null && typeof value === 'object' && Object.values(value).every(timingOnly);
assert.equal(records.length, 138, `Incomplete measurement session: ${records.length}/138`);
assert.equal(manifest.jobs.length, records.length);
const data = new Map();
const artifacts = [];
for (let index = 0; index < records.length; index++) {
  const record = records[index], job = manifest.jobs[index];
  assert.deepEqual([record.fixture, record.validation, record.run, record.version], [job.fixture, job.validation, job.run, job.version]);
  assert.equal(record.environment.head, 'e59e435aa1fc071ddd7b2eedd0ad4c407424b826');
  assert.equal(record.postGcDiscardedPairs, 1, 'Post-GC discard requires fresh samples');
  assert.equal(record.sentinelPasses, record.validation === 'on' ? 2 : 1);
  assert(record.warmup >= 10 && record.sampleCount >= 100 && record.explicitGc);
  assert.equal(record.officialEngineInstrumentation, false);
  assert.equal(record.toolSha256, records[0].toolSha256, 'Worker tool changed during the official session');
  assert.equal(record.sourceSha256, records[0].sourceSha256, 'Adapter source changed during the official session');
  assert.equal(record.boundaryWrapperInstalledAfterOfficialSamples, true);
  assert.equal(record.workerExit.code, 0); assert.equal(record.workerExit.signal, null);
  assert.equal(record.workerExit.natural, true);
  assert(record.serviceExits.length > 0 && record.serviceExits.every(exit => exit.code === 0 && exit.signal === null));
  if (index) assert(Date.parse(record.environment.started) > Date.parse(records[index - 1].environment.ended), 'Concurrent measurements');
  assert.equal(record.environment.node, records[0].environment.node);
  assert.equal(record.environment.v8, records[0].environment.v8);
  assert.equal(record.bundleEvidence[0].phaseHooks, 0);
  assert.match(record.bundleEvidence[0].sha256, /^[a-f0-9]{64}$/);
  const filename = path.join(output, record.timingFile), text = fs.readFileSync(filename, 'utf8');
  assert(Buffer.byteLength(text) <= 5_000_000 && timingOnly(JSON.parse(text)));
  const samples = JSON.parse(text);
  assert(Object.values(samples).every(values => values.length === 101));
  data.set(record.timingFile, samples);
  artifacts.push({ file: record.timingFile, bytes: Buffer.byteLength(text), sha256: hash(text) });
  for (const order of Object.values(record.ordering)) {
    assert.equal(order.pendingAtSentinel.p99, 0);
    assert.equal(order.tailScheduled.p99 + order.tailExecuted.p99, 0);
    if (record.version === 'new') assert.equal(order.scheduled.p99, 0);
    else assert(order.executed.median > 0 && order.pendingAtMicrotasks.median > 0);
  }
}
for (const version of ['old', 'new']) {
  const bundles = records.filter(record => record.version === version).map(record => record.bundleEvidence[0].sha256);
  assert(bundles.every(value => value === bundles[0]), 'Engine/fixture bundle changed');
}
for (const old of records.filter(record => record.version === 'old')) {
  const current = records.find(record => record.fixture === old.fixture && record.validation === old.validation &&
    record.run === old.run && record.version === 'new');
  for (const mode of Object.keys(old.checks))
    assert.deepEqual(Object.entries(old.checks[mode]).sort(([a], [b]) => a.localeCompare(b)),
      Object.entries(current.checks[mode]).sort(([a], [b]) => a.localeCompare(b)), 'Engine result values differ');
}
assert.equal(hash(fs.readFileSync(path.join(verification, 'tools/measure-verdict-121.mjs'))), records[0].toolSha256);

const controls = records.filter(record => record.sentinelPasses === 1).flatMap(record => ['empty-before', 'empty-after'].flatMap(mode => data.get(record.timingFile)[mode]));
const emptyMicro = metric(controls.map(row => row[0]));
const emptyEnd = metric(controls.map(row => row[1]));
const waiting = controls.map(row => row[1] - row[0]);
const waitMedian = metric(waiting).median;
const emptyNoise = percentile(waiting.map(value => Math.abs(value - waitMedian)), .95);
const calibration = { endToEndConstantMs: emptyEnd.median, microtaskConstantMs: emptyMicro.median,
  waitConstantMs: emptyEnd.median - emptyMicro.median, emptyEndToEnd: emptyEnd, emptyMicrotask: emptyMicro,
  wait: { ...metric(waiting), p5: percentile(waiting, .05), p95: percentile(waiting, .95),
    min: Math.min(...waiting), max: Math.max(...waiting), p95AbsoluteDeviationMs: emptyNoise },
  emptyEndToEndSpread: { p5: percentile(controls.map(row => row[1]), .05), p95: percentile(controls.map(row => row[1]), .95),
    min: Math.min(...controls.map(row => row[1])), max: Math.max(...controls.map(row => row[1])) },
  sameConstantForBothVersions: true, calls: controls.length,
  perRun: [1, 2, 3].map(run => { const rows = records.filter(record => record.sentinelPasses === 1 && record.run === run).flatMap(record =>
    ['empty-before', 'empty-after'].flatMap(mode => data.get(record.timingFile)[mode]));
    return { run, end: metric(rows.map(row => row[1])), microtask: metric(rows.map(row => row[0])),
      wait: metric(rows.map(row => row[1] - row[0])) }; }) };

const emptyEndCi = bootstrap(controls.map(row => row[1]), 9501);
const emptyMicroCi = bootstrap(controls.map(row => row[0]), 9502);
calibration.bootstrap99 = { emptyEnd: emptyEndCi, emptyMicrotask: emptyMicroCi };
calibration.sentinelPasses = 1;
calibration.bySentinelPasses = { 1: { ...calibration } };
const twoPassControls = records.filter(record => record.sentinelPasses === 2)
  .flatMap(record => ['empty-before', 'empty-after'].flatMap(mode => data.get(record.timingFile)[mode]));
const twoMicro = metric(twoPassControls.map(row => row[0]));
const twoEnd = metric(twoPassControls.map(row => row[1]));
const twoWait = twoPassControls.map(row => row[1] - row[0]), twoWaitMedian = metric(twoWait).median;
calibration.bySentinelPasses[2] = {
  sentinelPasses: 2, endToEndConstantMs: twoEnd.median, microtaskConstantMs: twoMicro.median,
  waitConstantMs: twoEnd.median - twoMicro.median, emptyEndToEnd: twoEnd, emptyMicrotask: twoMicro,
  wait: { ...metric(twoWait), p5: percentile(twoWait, .05), p95: percentile(twoWait, .95),
    min: Math.min(...twoWait), max: Math.max(...twoWait),
    p95AbsoluteDeviationMs: percentile(twoWait.map(value => Math.abs(value - twoWaitMedian)), .95) },
  emptyEndToEndSpread: { p5: percentile(twoPassControls.map(row => row[1]), .05),
    p95: percentile(twoPassControls.map(row => row[1]), .95),
    min: Math.min(...twoPassControls.map(row => row[1])), max: Math.max(...twoPassControls.map(row => row[1])) },
  bootstrap99: { emptyEnd: bootstrap(twoPassControls.map(row => row[1]), 9511),
    emptyMicrotask: bootstrap(twoPassControls.map(row => row[0]), 9512) },
  calls: twoPassControls.length, sameConstantForBothVersions: true,
  perRun: [1, 2, 3].map(run => {
    const rows = records.filter(record => record.sentinelPasses === 2 && record.run === run)
      .flatMap(record => ['empty-before', 'empty-after'].flatMap(mode => data.get(record.timingFile)[mode]));
    return { run, end: metric(rows.map(row => row[1])), microtask: metric(rows.map(row => row[0])),
      wait: metric(rows.map(row => row[1] - row[0])) };
  }),
};
calibration.callsAllPaths = controls.length + twoPassControls.length;
const validationRows = [];
const evaluated = new Map();
const settings = records.filter(record => record.run === 1 && record.version === 'old');
for (const setting of settings) {
  const selectedCalibration = calibration.bySentinelPasses[setting.sentinelPasses];
  const emptyEnd = selectedCalibration.emptyEndToEnd, emptyMicro = selectedCalibration.emptyMicrotask;
  const emptyNoise = selectedCalibration.wait.p95AbsoluteDeviationMs;
  const emptyEndCi = selectedCalibration.bootstrap99.emptyEnd;
  const emptyMicroCi = selectedCalibration.bootstrap99.emptyMicrotask;
  const modes = Object.keys(setting.ordering);
  for (const mode of modes) {
    const callCount = mode === 'update' ? setting.interactionCount : mode === 'axis-update' ? 2 : 1;
    const versions = {};
    for (const version of ['old', 'new']) {
      const runs = [];
      for (const run of [1, 2, 3]) {
        const record = records.find(item => item.fixture === setting.fixture && item.validation === setting.validation && item.run === run && item.version === version);
        const samples = data.get(record.timingFile);
        const microtask = samples[mode].map(row => row[0] - emptyMicro.median * callCount);
        const sentinel = samples[mode].map(row => row[1] - emptyEnd.median * callCount);
        const callback = samples[`${mode}-callback`];
        const sum = microtask.map((value, index) => value + callback[index]);
        const expected = version === 'new' ? microtask : sum;
        assert.equal(record.timingColumns[2], 'pairedEmptyTailMs', 'Paired empty tail requires fresh samples');
        assert(samples[mode].every(row => row.length === 3 && Number.isFinite(row[2])));
        const pairedSentinel = sentinel.map((value, index) =>
          value - (samples[mode][index][2] - callCount * (emptyEnd.median - emptyMicro.median)));
        const order = record.ordering[mode];
        const zeroEngineMacrotasks = version !== 'new' || ['scheduled', 'executed', 'pendingAtMicrotasks',
          'pendingAtSentinel', 'tailScheduled', 'tailExecuted'].every(key => order[key].p99 === 0);
        const sentinelCi = bootstrap(sentinel, run * 100 + 95), expectedCi = bootstrap(expected, run * 100 + 96);
        const noise = Math.max(.001, callCount * emptyNoise + sentinelCi.halfWidth + expectedCi.halfWidth +
          callCount * (emptyEndCi.halfWidth + emptyMicroCi.halfWidth));
        const a = version === 'new' ? validationA121(pairedSentinel, expected, noise, [order]) : null;
        const difference = version === 'new' ? a.differenceMs :
          metric(sentinel).median - metric(expected).median;
        runs.push({ run, sentinel: metric(sentinel), microtask: metric(microtask), callback: metric(callback), sum: metric(sum),
          sumOfMediansMs: metric(microtask).median + metric(callback).median,
          differenceMs: difference, noiseMs: noise, withinNoise: Math.abs(difference) <= noise,
          zeroEngineMacrotasks,
          bootstrap99: { sentinel: sentinelCi, expected: expectedCi },
          values: { sentinel, microtask, callback, sum, pairedSentinel } });
      }
      const pooled = Object.fromEntries(['sentinel', 'microtask', 'callback', 'sum', 'pairedSentinel'].map(key => [key, runs.flatMap(run => run.values[key])]));
      const expectedKey = version === 'new' ? 'microtask' : 'sum';
      const sentinelCi = bootstrap(pooled.sentinel, 9593), expectedCi = bootstrap(pooled[expectedKey], 9594);
      const noise = Math.max(.001, callCount * emptyNoise + sentinelCi.halfWidth + expectedCi.halfWidth +
        callCount * (emptyEndCi.halfWidth + emptyMicroCi.halfWidth));
      const a = version === 'new' ? validationA121(pooled.pairedSentinel, pooled[expectedKey], noise,
        [1, 2, 3].map(run => records.find(item => item.fixture === setting.fixture && item.validation === setting.validation && item.run === run && item.version === version).ordering[mode])) : null;
      const difference = version === 'new' ? a.differenceMs :
        metric(pooled.sentinel).median - metric(pooled[expectedKey]).median;
      const withinNoise = Math.abs(difference) <= noise;
      const fallback = version === 'old' && (!withinNoise || runs.some(run => !run.withinNoise));
      const selected = fallback ? 'sum' : 'sentinel';
      versions[version] = { metric: metric(pooled[selected]), sentinel: metric(pooled.sentinel),
        pairedSentinel: metric(pooled.pairedSentinel),
        microtask: metric(pooled.microtask), callback: metric(pooled.callback), sum: metric(pooled.sum),
        sumOfMediansMs: metric(pooled.microtask).median + metric(pooled.callback).median,
        source: selected, fallback, validation: { withinNoise, allRunsWithinNoise: runs.every(run => run.withinNoise),
          zeroEngineMacrotasks: runs.every(run => run.zeroEngineMacrotasks),
          passed: withinNoise && runs.every(run => run.withinNoise && run.zeroEngineMacrotasks),
          differenceMs: difference, noiseMs: noise, bootstrap99: { sentinel: sentinelCi, expected: expectedCi } },
        runs: runs.map(run => ({ ...run, values: undefined, metric: run[selected] })) };
    }
    const validation = { fixture: setting.fixture, validation: setting.validation, sentinelPasses: setting.sentinelPasses, mode, callCount,
      a: versions.new.validation, b: versions.old.validation, oldFallback: versions.old.fallback,
      newSentinel: versions.new.sentinel, newMicrotask: versions.new.microtask,
      newPairedSentinel: versions.new.pairedSentinel,
      oldSentinel: versions.old.sentinel, oldMicrotask: versions.old.microtask,
      oldCallback: versions.old.callback, oldSum: versions.old.sum };
    validationRows.push(validation);
    evaluated.set(`${setting.fixture}/${setting.validation}/${mode}`, versions);
  }
}

const makeRow = (base, axis = false) => {
  const measureMode = axis ? ({ mount: 'mount', update: 'axis-update', 'update-first': 'axis-first', 'update-later': 'axis-later' })[base.mode] : base.mode;
  const versions = evaluated.get(`${base.fixture}/${base.validation}/${measureMode}`);
  assert(versions);
  const branchless = !/oneOf|if-then|computed/.test(base.fixture);
  const group = branchless ? 'branchless' : base.fixture === 'computed-visible-derived' ? 'expression' : 'branched';
  const target = group === 'branched' ? null : 1.5;
  const ratio = versions.new.metric.median / versions.old.metric.median;
  const runRatios = [0, 1, 2].map(index => versions.new.runs[index].metric.median / versions.old.runs[index].metric.median);
  const tie = target !== null && runRatios.some(value => value <= target) && runRatios.some(value => value > target);
  const verdict = target === null ? base.validation === 'on' ? '검증 ON 기록 전용' : '91라운드 기준별 판단' :
    tie ? '동률·충족' : ratio <= target ? '충족' : '미달';
  return { lane: axis ? 'core-axis' : 'core', fixture: base.fixture, validation: base.validation, mode: base.mode,
    group, target, ratio, runRatios, tie, verdict, old: versions.old, new: versions.new };
};
const officialRows = previous.officialRows.filter(row => row.lane === 'core').map(row => makeRow(row));
const updateSplitRows = previous.updateSplitRows.filter(row => row.lane === 'core').map(row => makeRow(row));
const branchAxisRows = previous.branchAxisRows.map(row => makeRow(row, true));
const groupCounts = Object.fromEntries(['branchless', 'expression'].map(group => [`core-${group}`, counts(officialRows.filter(row => row.group === group))]));
const updateSplitGroupCounts = Object.fromEntries(['branchless', 'expression'].map(group => [`core-${group}`, counts(updateSplitRows.filter(row => row.group === group))]));
const flips = (rows, older) => rows.filter(row => row.target !== null).flatMap(row => {
  const before = older.find(item => item.lane === 'core' && item.fixture === row.fixture && item.validation === row.validation && item.mode === row.mode);
  assert(before);
  const wasMet = before.correctedVerdict !== '미달', nowMet = row.verdict !== '미달';
  return wasMet === nowMet ? [] : [{ fixture: row.fixture, mode: row.mode, group: row.group,
    before: before.tie && wasMet ? '동률·충족' : before.correctedVerdict, after: row.verdict, beforeRatio: before.correctedRatio, afterRatio: row.ratio, runRatios: row.runRatios }];
});
const aFailures = validationRows.filter(row => !row.a.passed);
const bFallbacks = validationRows.filter(row => row.oldFallback);
const releaseSourceSets = { ...(manifest.releaseSourceSets ?? {}) };
const compactRecords = records.map(record => {
  if (!record.releaseSources) return record;
  const sources = Object.fromEntries(Object.entries(record.releaseSources).sort(([a], [b]) => a.localeCompare(b)));
  const id = hash(JSON.stringify(sources));
  releaseSourceSets[id] ??= sources;
  return { ...record, releaseSources: undefined, releaseSourceSet: id };
});
const summary = { title: '121 코어 종단 판정표', status: aFailures.length ? 'validation-a-failed' : 'official',
  environment: { targetHead: 'e59e435aa1fc071ddd7b2eedd0ad4c407424b826', productSourceHead: 'e59e435aa1fc071ddd7b2eedd0ad4c407424b826', old: '@canard/schema-form@0.16.0',
    node: records[0].environment.node, v8: records[0].environment.v8, cpu: records[0].environment.cpu,
    platform: records[0].environment.platform, arch: records[0].environment.arch,
    started: records[0].environment.started, ended: records.at(-1).environment.ended,
    session: 'one uninterrupted sequential session; all prior partial samples discarded',
    processCount: records.length, concurrency: 1, warmup: 12, samplesPerRun: 101, samplesPerVersion: 303 },
  method: { endpoint: 'call -> 64 Promise checkpoints -> sentinel setImmediate; validation OFF uses one pass, ON drains 64 further checkpoints and uses a second same-queue FIFO sentinel for deferred error-event resets',
    gc: 'explicit collection and check anchor outside timed span; discard one empty paired call before the measured empty pair/sample',
    correction: 'empty constants pooled separately for the one-pass OFF and two-pass ON paths; each path uses the same fixed end-to-end and microtask constants for both versions',
    callbackFallback: 'uninstrumented microtask time + callback execution measured later at one scheduling boundary; all three runs use sum if any run fails validation B',
    callbackPairing: 'separate diagnostic samples combined by ordinal within the same fixture/run; median of sample sums, plus sum of medians recorded',
    noise: 'predeclared max(1us, empty-wait p95 absolute deviation per call + independent median bootstrap 99% half-widths + calibration median uncertainty); conservative noise comparison, not a significance/equivalence test',
    bootstrap: '1000 deterministic seeded resamples; intervals and tolerance per row/run',
    calibrationAStatistic: 'median of per-sample corrected sentinel minus corrected microtask; independently paired preceding empty tail replaces fixed waiting delay; zero engine macrotasks additionally required; per run and pooled',
    tie: '94C-02: any run <= target and any run > target => tie/met; otherwise pooled median ratio; core target 1.5',
    negativeClipping: false, officialEngineInstrumentation: false, reactRemeasured: false },
  calibration, validation: { a: { rows: validationRows.length, matched: validationRows.length - aFailures.length,
    failedRows: aFailures.map(row => `${row.fixture}/${row.validation}/${row.mode}`) },
    b: { rows: validationRows.length, sumFallbacks: bFallbacks.length,
      matchedWithoutFallback: validationRows.length - bFallbacks.length,
      fallbackRows: bFallbacks.map(row => `${row.fixture}/${row.validation}/${row.mode}`) }, rows: validationRows },
  groupCounts, updateSplitGroupCounts, officialRows, updateSplitRows, branchAxisRows,
  flipsVs93Corrected: flips(officialRows, previous.officialRows), splitFlipsVs93Corrected: flips(updateSplitRows, previous.updateSplitRows),
  react: { source: 'verdict-93c01.md + verdict-93c01-summary.json (94C-02 corrected)',
    sourceSummarySha256: hash(fs.readFileSync(path.join(output, 'verdict-93c01-summary.json'))),
    branchless: previous.groupCounts['react-branchless'], expression: previous.groupCounts['react-expression'],
    updateSplitBranchless: previous.updateSplitGroupCounts['react-branchless'], updateSplitExpression: previous.updateSplitGroupCounts['react-expression'] },
  branched: { criterion: 'round 91: growth in untouched branch count and duplicated phase work; ratios alone confer no pass',
    offRows: officialRows.filter(row => row.group === 'branched' && row.validation === 'off').length,
    onRows: officialRows.filter(row => row.group === 'branched' && row.validation === 'on').length,
    axisRows: branchAxisRows.length },
  records: compactRecords, releaseSourceSets, jobs: manifest.jobs, externalHeadChange: null, discardedPartialRuns: manifest.discardedPartialRuns, toolChecks: manifest.toolChecks,
  sourceDocuments: Object.fromEntries(['round-93-closing.md', 'round-94-closing.md', 'round-95-closing.md', 'round-120-closing.md'].map(name => {
    const source = `origin/1.0.0-beta:packages/canard/schema-form/architecture/reviews/${name}`;
    return [name, { source, sha256: hash(execFileSync('git', ['show', source], { cwd: repo })) }];
  })),
  preliminaryProcesses: manifest.preliminaryProcesses, preliminaryNote: manifest.preliminaryNote,
  artifacts, reportToolSha256: hash(fs.readFileSync(fileURLToPath(import.meta.url))) };

const f = value => value.toFixed(4);
const modeLabel = { mount: '마운트', update: 'BF 갱신 열', 'update-first': '첫 갱신', 'update-later': '이후 갱신' };
const table = rows => ['| 픽스처 | 검증 | 작업 | 구 median / p99 ms | 새 median / p99 ms | 배율 | 회차 1 / 2 / 3 | 구 값 | 판정 |',
  '| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |',
  ...rows.map(row => `| ${row.fixture} | ${row.validation} | ${modeLabel[row.mode]} | ${f(row.old.metric.median)} / ${f(row.old.metric.p99)} | ${f(row.new.metric.median)} / ${f(row.new.metric.p99)} | ${f(row.ratio)}× | ${row.runRatios.map(value => f(value) + '×').join(' / ')} | ${row.old.fallback ? '(나) 합' : '종단'} | ${row.verdict} |`)].join('\n');
const validations = validationRows.map(row => `| ${row.fixture} | ${row.validation} | ${modeLabel[row.mode] ?? row.mode} | ${f(row.newPairedSentinel.median * 1000)} / ${f(row.newMicrotask.median * 1000)} | ${f(row.a.differenceMs * 1000)} / ${f(row.a.noiseMs * 1000)} | ${f(row.oldSentinel.median * 1000)} / ${f(row.oldSum.median * 1000)} | ${f(row.b.differenceMs * 1000)} / ${f(row.b.noiseMs * 1000)} | ${row.oldFallback ? '(나) 합 사용' : '종단 사용'} |`);
const flipLines = summary.flipsVs93Corrected.map(row => `- ${row.fixture}/${row.mode}: ${row.before} → ${row.after} (${f(row.beforeRatio)}× → ${f(row.afterRatio)}×)`);
const markdown = `# 121 코어 종단 판정표\n\n${summary.status === 'official' ? '새 도구로 수집한 세 회차의 종단과 검증 (가)/(나)를 적용했습니다.' : '검증 (가)가 실패하여 공식 판정이 성립하지 않았습니다.'}\n\n대상 ${summary.environment.targetHead}, 구 판 0.16.0, Node ${summary.environment.node}, V8 ${summary.environment.v8}. ${summary.environment.started}–${summary.environment.ended}. 프로세스 ${records.length}개, 동시 측정 1개, 회차별 old→new / new→old / old→new, 예열 ${records[0].warmup}·표본 ${records[0].sampleCount}.\n\n## 검증 (가)/(나)\n\n(가) ${summary.validation.a.matched}/${validationRows.length}행 통과. (나) ${summary.validation.b.matchedWithoutFallback}/${validationRows.length}행 일치, ${bFallbacks.length}행 합으로 대체. 경계 검사는 공식 표본 이후 별도로 수행합니다. 음수 clipping은 없습니다.\n\n| 픽스처 | 검증 | 작업 | 새 종단 / micro µs | (가) 차이 / 잡음 µs | 구 종단 / (나) 합 µs | (나) 차이 / 잡음 µs | 구 공식 선택 |\n| --- | --- | --- | ---: | ---: | ---: | ---: | --- |\n${validations.join('\n')}\n\n## 마운트·갱신\n\n${table(officialRows)}\n\n## 첫 갱신·이후 갱신\n\n${table(updateSplitRows)}\n\n## 분기 수 축\n\n분기 행에는 배율 게이트를 적용하지 않습니다.\n\n${table(branchAxisRows)}\n\n## 이전 표와의 비교\n\n공식 열 뒤집힘 ${summary.flipsVs93Corrected.length}행. 측정 방법이 달라 제품 변경의 효과로 해석하지 않습니다.\n\n${flipLines.join('\n')}\n\nReact는 이 코어 실행에서 재측정하지 않았습니다. React 필드는 93 자료 재사용입니다. 원자료 및 번들 해시는 summary JSON에 있습니다.\n`;

const sentinelMethodParagraph = "GC와 check anchor는 clock 밖에서 수행하고, 빈 paired call 하나를 버립니다. 그 다음 각 실제 호출 바로 앞의 빈 호출을 같은 64 Promise 체크포인트 및 OFF 1-pass/ON 2-pass FIFO sentinel로 측정합니다. pairedEmptyTailMs는 그 빈 호출의 종단−microtask 꼬리입니다. (가)는 각 표본의 보정 종단에서 짝 빈 꼬리의 보정값을 뺀 값과 보정 microtask의 차이 중앙값을 회차별 및 pooled로 비교합니다. 빈 대기 p95 절대 편차, seeded bootstrap 99% 오차, 하한 1 µs의 잡음 폭과 경계 검사에서 엔진 macrotask·pending·후속 예약/실행 0회 조건을 유지합니다. 버린 쌍은 표본·보정 상수에 포함하지 않으며 postGcDiscardedPairs=1인 새 원자료만 받습니다.";
const markdownWithMethod = markdown.replace('## 검증 (가)/(나)\n\n',
  `## 검증 (가)/(나)\n\n${sentinelMethodParagraph}\n\n`);

if (process.argv.includes('--check')) {
  assert.equal(manifest.status, 'official');
  assert.equal(aFailures.length, 0, 'Validation A failed');
  assert.deepEqual(manifest.calibration.bySentinelPasses, calibration.bySentinelPasses);
  assert.deepEqual(manifest.validation.a, summary.validation.a);
  assert.deepEqual(manifest.validation.b, summary.validation.b);
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(),
    'e59e435aa1fc071ddd7b2eedd0ad4c407424b826');
  assert.deepEqual(manifest.groupCounts, groupCounts);
  assert.deepEqual(manifest.updateSplitGroupCounts, updateSplitGroupCounts);
  assert.deepEqual(manifest.flipsVs93Corrected, summary.flipsVs93Corrected);
  assert.equal(summary.react.branchless.met, 22); assert.equal(summary.react.expression.met, 2);
  assert.equal(summary.react.updateSplitBranchless.met, 20); assert.equal(summary.react.updateSplitExpression.met, 2);
  assert.equal(officialRows.length, 46); assert.equal(updateSplitRows.length, 46); assert.equal(branchAxisRows.length, 16);
  assert(fs.readFileSync(path.join(output, 'verdict-121.md'), 'utf8').includes('121 코어 종단 판정표'));
  assert.equal(execFileSync('git', ['--no-optional-locks', 'diff', '--name-only',
    'HEAD', '--', 'packages/canard/schema-form/src'], { cwd: repo, encoding: 'utf8' }).trim(), '');
  console.log('ARTIFACTS_121_OK');
} else if (process.argv.includes('--transport')) {
  console.log(JSON.stringify({ summary: { ...summary, records: undefined, preliminaryProcesses: undefined },
    markdown: markdownWithMethod, recordSourceIds: compactRecords.map(record => record.releaseSourceSet) }));
} else console.log(JSON.stringify({ summary, markdown: markdownWithMethod }));
}
}
