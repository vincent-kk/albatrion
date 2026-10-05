// CLI report: derives official rows from timing-only files; emits artifacts for native writes.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const output = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(output, '../../../../../..');
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
const hash = value => createHash('sha256').update(value).digest('hex');
const manifest = JSON.parse(fs.readFileSync(path.join(output, 'verdict-95c01-summary.json'), 'utf8'));
const previous = JSON.parse(fs.readFileSync(path.join(output, 'verdict-93c01-summary.json'), 'utf8'));
const records = manifest.records;
const metric = values => {
  const sorted = values.toSorted((a, b) => a - b);
  assert(sorted.length && sorted.every(Number.isFinite));
  return { median: sorted[Math.ceil(sorted.length * .5) - 1], p99: sorted[Math.ceil(sorted.length * .99) - 1], samples: sorted.length };
};
const percentile = (values, proportion) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * proportion) - 1];
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
  assert.equal(record.environment.head, '4d2e54533dc8feaccb4742be9dd322e46d20be58');
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
assert.equal(hash(fs.readFileSync(path.join(output, 'tools/measure-verdict-95c01.mjs'))), records[0].toolSha256);

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

/** Seeded resampling estimates the median's 99% interval without external packages. */
function bootstrap(values, seed) {
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
        const sentinelCi = bootstrap(sentinel, run * 100 + 95), expectedCi = bootstrap(expected, run * 100 + 96);
        const noise = Math.max(.001, callCount * emptyNoise + sentinelCi.halfWidth + expectedCi.halfWidth +
          callCount * (emptyEndCi.halfWidth + emptyMicroCi.halfWidth));
        const difference = metric(sentinel).median - metric(expected).median;
        runs.push({ run, sentinel: metric(sentinel), microtask: metric(microtask), callback: metric(callback), sum: metric(sum),
          sumOfMediansMs: metric(microtask).median + metric(callback).median,
          differenceMs: difference, noiseMs: noise, withinNoise: Math.abs(difference) <= noise,
          bootstrap99: { sentinel: sentinelCi, expected: expectedCi },
          values: { sentinel, microtask, callback, sum } });
      }
      const pooled = Object.fromEntries(['sentinel', 'microtask', 'callback', 'sum'].map(key => [key, runs.flatMap(run => run.values[key])]));
      const expectedKey = version === 'new' ? 'microtask' : 'sum';
      const sentinelCi = bootstrap(pooled.sentinel, 9593), expectedCi = bootstrap(pooled[expectedKey], 9594);
      const noise = Math.max(.001, callCount * emptyNoise + sentinelCi.halfWidth + expectedCi.halfWidth +
        callCount * (emptyEndCi.halfWidth + emptyMicroCi.halfWidth));
      const difference = metric(pooled.sentinel).median - metric(pooled[expectedKey]).median;
      const withinNoise = Math.abs(difference) <= noise;
      const fallback = version === 'old' && (!withinNoise || runs.some(run => !run.withinNoise));
      const selected = fallback ? 'sum' : 'sentinel';
      versions[version] = { metric: metric(pooled[selected]), sentinel: metric(pooled.sentinel),
        microtask: metric(pooled.microtask), callback: metric(pooled.callback), sum: metric(pooled.sum),
        sumOfMediansMs: metric(pooled.microtask).median + metric(pooled.callback).median,
        source: selected, fallback, validation: { withinNoise, allRunsWithinNoise: runs.every(run => run.withinNoise),
          differenceMs: difference, noiseMs: noise, bootstrap99: { sentinel: sentinelCi, expected: expectedCi } },
        runs: runs.map(run => ({ ...run, values: undefined, metric: run[selected] })) };
    }
    const validation = { fixture: setting.fixture, validation: setting.validation, sentinelPasses: setting.sentinelPasses, mode, callCount,
      a: versions.new.validation, b: versions.old.validation, oldFallback: versions.old.fallback,
      newSentinel: versions.new.sentinel, newMicrotask: versions.new.microtask,
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
const aFailures = validationRows.filter(row => !row.a.withinNoise || !row.a.allRunsWithinNoise);
const bFallbacks = validationRows.filter(row => row.oldFallback);
const releaseSourceSets = { ...(manifest.releaseSourceSets ?? {}) };
const compactRecords = records.map(record => {
  if (!record.releaseSources) return record;
  const sources = Object.fromEntries(Object.entries(record.releaseSources).sort(([a], [b]) => a.localeCompare(b)));
  const id = hash(JSON.stringify(sources));
  releaseSourceSets[id] ??= sources;
  return { ...record, releaseSources: undefined, releaseSourceSet: id };
});
const summary = { title: '95C-01 공식 코어 종단 판정표', status: aFailures.length ? 'validation-a-failed' : 'official',
  environment: { targetHead: '4d2e54533dc8feaccb4742be9dd322e46d20be58', productSourceHead: '5982d51a79c9c5e9e3568d3479d7bf04e242fd52', old: '@canard/schema-form@0.16.0',
    node: records[0].environment.node, v8: records[0].environment.v8, cpu: records[0].environment.cpu,
    platform: records[0].environment.platform, arch: records[0].environment.arch,
    started: records[0].environment.started, ended: records.at(-1).environment.ended,
    session: 'one uninterrupted sequential session; all prior partial samples discarded',
    processCount: records.length, concurrency: 1, warmup: 12, samplesPerRun: 101, samplesPerVersion: 303 },
  method: { endpoint: 'call -> 64 Promise checkpoints -> sentinel setImmediate; validation OFF uses one pass, ON drains 64 further checkpoints and uses a second same-queue FIFO sentinel for deferred error-event resets',
    gc: 'explicit collection outside timed span; check-phase anchor completes GC follow-up before sample',
    correction: 'empty constants pooled separately for the one-pass OFF and two-pass ON paths; each path uses the same fixed end-to-end and microtask constants for both versions',
    callbackFallback: 'uninstrumented microtask time + callback execution measured later at one scheduling boundary; all three runs use sum if any run fails validation B',
    callbackPairing: 'separate diagnostic samples combined by ordinal within the same fixture/run; median of sample sums, plus sum of medians recorded',
    noise: 'predeclared max(1us, empty-wait p95 absolute deviation per call + independent median bootstrap 99% half-widths + calibration median uncertainty); conservative noise comparison, not a significance/equivalence test',
    bootstrap: '1000 deterministic seeded resamples; intervals and tolerance per row/run',
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
  sourceDocuments: Object.fromEntries(['round-93-closing.md', 'round-94-closing.md', 'round-95-closing.md'].map(name => {
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
const validations = validationRows.map(row => `| ${row.fixture} | ${row.validation} | ${modeLabel[row.mode] ?? row.mode} | ${f(row.newSentinel.median * 1000)} / ${f(row.newMicrotask.median * 1000)} | ${f(row.a.differenceMs * 1000)} / ${f(row.a.noiseMs * 1000)} | ${f(row.oldSentinel.median * 1000)} / ${f(row.oldSum.median * 1000)} | ${f(row.b.differenceMs * 1000)} / ${f(row.b.noiseMs * 1000)} | ${row.oldFallback ? '(나) 합 사용' : '종단 사용'} |`);
const flipLines = summary.flipsVs93Corrected.map(row => `- ${row.fixture}/${row.mode}: ${row.before} → ${row.after} (${f(row.beforeRatio)}× → ${f(row.afterRatio)}×)`);
const markdown = `# 95C-01 공식 코어 종단 판정표\n\n${summary.status === 'official' ? '95C-01의 종단 정의와 검증 (가)/(나)를 적용한 공식 코어 표입니다. 93C-01의 코어 표는 공식 용도에서 대체된 단계별 진단 자료입니다.' : '검증 (가)가 실패하여 공식 판정이 성립하지 않았습니다. 93 표는 대체하지 않습니다.'}\n\n대상 ${summary.environment.targetHead}, 구 판 0.16.0, ${summary.environment.cpu}, Node **${summary.environment.node}**, V8 **${summary.environment.v8}**. ${summary.environment.started}–${summary.environment.ended}. 프로세스 ${records.length}개, 동시 측정 1개, 회차별 old→new / new→old / old→new, 각 예열 12·표본 101·판마다 303, 명시적 GC, 최근접 순위 median/p99입니다. 제품 엔진 내부 계측이 없습니다.\n\n## 종단·대기 보정과 FIFO 근거\n\n호출이 반환된 뒤 64 Promise 체크포인트를 거친 다음 sentinel setImmediate를 예약합니다. 검증 OFF는 첫 check 큐에서 끝나며, ON은 검증 이후 오류 이벤트가 배치 초기화를 다음 check 큐에 예약하므로 추가 64 체크포인트 뒤 두 번째 sentinel까지 잽니다. 마지막 엔진 콜백 뒤에 예약된 마지막 sentinel이 같은 check 큐에서 FIFO로 실행되는 것이 종단입니다. 마운트가 동기로 예약한 배치 초기화와 그 호출의 microtask에서 예약한 onChange는 모두 sentinel보다 먼저 예약됩니다. 갱신도 완전히 정착한 마운트/이전 쓰기 뒤에 시작하고 같은 순서를 따릅니다. check 단계 중 예약된 콜백은 다음 check 큐에 들어가더라도 엔진→sentinel FIFO 순서를 유지합니다. Node는 각 콜백 뒤의 microtask도 다음 콜백 전에 배출하므로 마지막 엔진 콜백의 microtask 뒤에 sentinel이 돕니다.\n\n스케줄링 검증은 공식 표본 수집 후 단일 scheduleMacrotaskSafe 경계만 감쌌습니다. 모든 마운트·갱신에서 최종 sentinel 시점 pending=0, 이후 128 체크포인트와 다음 sentinel까지 추가 예약/실행=0입니다. 새 판 예약=0이고 구 판의 microtask 경계에는 콜백이 남습니다. 합성 마운트·갱신 및 콜백→microtask→다음 check 큐의 중첩 콜백 검증도 통과했으며 조기 sentinel은 FIFO assertion에서 실패했습니다. esbuild는 stdin EOF 후 code 0, 측정 worker는 signal 없이 code 0으로 자연 종료했습니다.\n\n같은 세션의 빈 호출을 OFF의 1-pass와 ON의 2-pass 각각 같은 방법으로 재었습니다. 각 경로의 보정 상수는 두 판에 동일하게 적용합니다. GC 뒤의 별도 check 앵커는 시간 구간 밖에서 GC 후속 처리를 완료합니다. 표의 고정 보정값 C는 해당 경로의 빈 호출 전체 종단 중앙값이며 두 판에서 호출마다 동일하게 뺍니다. microtask 검증에는 빈 microtask 중앙값 M을 빼므로 순수 대기 보정은 C−M입니다. BF 열은 쓰기마다 측정한 시간의 합이며 C/M도 쓰기 수만큼 뺍니다. 음수 clipping을 하지 않습니다.\n\n| 상수/분산 (µs) | 값 | p5–p95 | p99 | 표본 |\n| --- | ---: | ---: | ---: | ---: |\n| C: OFF 빈 종단, 두 판 공통 | ${f(emptyEnd.median * 1000)} | ${f(calibration.emptyEndToEndSpread.p5 * 1000)}–${f(calibration.emptyEndToEndSpread.p95 * 1000)} | ${f(emptyEnd.p99 * 1000)} | ${controls.length} |\n| M: OFF 빈 microtask | ${f(emptyMicro.median * 1000)} | — | ${f(emptyMicro.p99 * 1000)} | ${controls.length} |\n| OFF 순수 루프 대기 C−M | ${f(calibration.waitConstantMs * 1000)} | ${f(calibration.wait.p5 * 1000)}–${f(calibration.wait.p95 * 1000)} | ${f(calibration.wait.p99 * 1000)} | ${controls.length} |\n| C: ON 빈 종단, 두 판 공통 | ${f(twoEnd.median * 1000)} | ${f(calibration.bySentinelPasses[2].emptyEndToEndSpread.p5 * 1000)}–${f(calibration.bySentinelPasses[2].emptyEndToEndSpread.p95 * 1000)} | ${f(twoEnd.p99 * 1000)} | ${twoPassControls.length} |\n| M: ON 빈 microtask | ${f(twoMicro.median * 1000)} | — | ${f(twoMicro.p99 * 1000)} | ${twoPassControls.length} |\n| ON 순수 루프 대기 C−M | ${f(calibration.bySentinelPasses[2].waitConstantMs * 1000)} | ${f(calibration.bySentinelPasses[2].wait.p5 * 1000)}–${f(calibration.bySentinelPasses[2].wait.p95 * 1000)} | ${f(calibration.bySentinelPasses[2].wait.p99 * 1000)} | ${twoPassControls.length} |\n\n## 검증 (가)/(나)\n\n(가) 새 엔진의 보정 종단과 보정 microtask 값은 ${summary.validation.a.matched}/${validationRows.length}행에서 잡음 범위 안입니다. (나) 구 엔진은 ${summary.validation.b.matchedWithoutFallback}/${validationRows.length}행에서 모든 회차가 일치하며 ${bFallbacks.length}행은 합으로 대체했습니다. 콜백 실행은 별도 후속 실행에서 callback 전후 두 clock으로 잰 실제 실행 합입니다. 공식 microtask 표본과 별도 콜백 표본을 회차 내 순번별로 합쳐 중앙값/p99를 구합니다. 내부 함수 span이나 async_hooks는 없습니다. 대체가 필요한 행은 종단과 (나) 합의 차이가 미리 정한 잡음 폭을 넘었기 때문이며, 한 회차라도 실패하면 그 행의 세 회차 구 값 전체를 (나) 합으로 통일합니다.\n\n잡음 폭은 측정 전에 정한 빈 대기 잔차 p95 절대 편차와 각 중앙값의 bootstrap 99% 오차를 더한 보수적 범위입니다(하한 1µs). 쌍의 상관을 이용한 유의성/등가 검정은 아닙니다. 각 회차의 차이·범위·결과는 summary JSON에 있습니다.\n\n| 픽스처 | 검증 | 작업 | 새 종단 / micro µs | (가) 차이 / 잡음 µs | 구 종단 / (나) 합 µs | (나) 차이 / 잡음 µs | 구 공식 선택 |\n| --- | --- | --- | ---: | ---: | ---: | ---: | --- |\n${validations.join('\n')}\n\n## 공식 코어 표 — 85C-01 / 94C-02\n\n분기 없음과 식 전용의 목표는 마운트·갱신 모두 <=1.5×입니다. 목표선 양쪽에 회차가 있으면 동률·충족이며, 한쪽이면 전체 표본 중앙값 비로 판단합니다. 분기 행에는 1.5× 게이트를 적용하지 않고 91라운드의 건드리지 않은 분기 증가·단계 중복 기준으로 남깁니다.\n\n${table(officialRows)}\n\n| 그룹 | 충족 / 전체 | 미달 | 동률 포함 |\n| --- | ---: | ---: | ---: |\n| 코어 분기 없음 | ${groupCounts['core-branchless'].met}/24 | ${groupCounts['core-branchless'].missed} | ${groupCounts['core-branchless'].ties} |\n| 코어 식 전용 | ${groupCounts['core-expression'].met}/2 | ${groupCounts['core-expression'].missed} | ${groupCounts['core-expression'].ties} |\n| 분기 OFF | 기록 ${summary.branched.offRows}행 | 91 기준 | — |\n| 분기 ON | 기록 ${summary.branched.onRows}행 | 검증 포함 기록 | — |\n\n## BF 첫 갱신과 이후 갱신\n\n첫 갱신은 마운트가 sentinel까지 정착한 직후의 첫 BF interaction입니다. 이후 갱신은 BF 전체 열이 정착한 뒤 첫 interaction을 실제 값 변경으로 반복합니다. oneOf/if는 동일한 왕복 전환입니다. 아래 split 수는 공식 mount/BF 열 그룹 수와 별도입니다. 분기 없음 ${updateSplitGroupCounts['core-branchless'].met}/24, 식 전용 ${updateSplitGroupCounts['core-expression'].met}/2입니다.\n\n${table(updateSplitRows)}\n\n## 분기 수 축 — 91라운드 기록\n\n건드리는 두 분기를 kind_0→kind_4→kind_0으로 고정했습니다. branch 수 5/10/20/40, 건드리지 않은 수 3/8/18/38입니다. 배율을 기록하며 이 표로 91 기준 충족을 선언하지 않습니다.\n\n${table(branchAxisRows)}\n\n## 93C-01 정정 표와 판정이 바뀐 행\n\n공식 mount/BF 열의 뒤집힘은 ${summary.flipsVs93Corrected.length}행입니다. 93의 보정 배율과 동률 정정을 적용한 correctedVerdict와 비교했습니다. 두 표의 측정 방법이 다르므로 이 차이를 제품 변경의 효과로 해석하지 않습니다.\n\n${flipLines.length ? flipLines.join('\n') : '없습니다.'}\n\nBF split 뒤집힘 ${summary.splitFlipsVs93Corrected.length}행은 summary JSON에 있습니다.\n\n## React — 기존 정정 Profiler 결과 재사용\n\nReact는 이번 종단 측정에 포함하지 않았습니다. 93C-01의 production Profiler 값과 94C-02를 재사용하여 분기 없음 **22/24**, 식 전용 **2/2**입니다. 첫/이후 갱신 split은 분기 없음 **20/24**, 식 전용 **2/2**입니다. 분기 React 행은 기존 91 기준 판단을 유지합니다.\n\n## 재현과 검증\n\n\`yarn node packages/canard/schema-form/architecture/verification/07-switch/tools/measure-verdict-95c01.mjs --self-check\`\n\n\`/opt/homebrew/opt/node/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/tools/measure-verdict-95c01.mjs sample-0 off 1 old\`\n\n\`yarn node packages/canard/schema-form/architecture/verification/07-switch/tools/run-verdict-95c01.mjs\` 는 138개 자연 종료 프로세스를 순차 실행하여 stdout JSONL을 냅니다. timings만 시간 JSON으로 저장하고 summary 세부는 중앙 JSON에 합칩니다. 이 세션에서는 각 worker가 자연 종료한 뒤 native apply_patch로 저장했습니다. 도구가 파일이나 git을 쓰지 않습니다.\n\n\`yarn node packages/canard/schema-form/architecture/verification/07-switch/tools/report-verdict-95c01.mjs --check\`\n\n시간 파일 ${artifacts.length}개, 최대 ${Math.max(...artifacts.map(item => item.bytes))}바이트입니다. 시간 숫자만 있고 모두 5MB 이내입니다. 입력/번들/도구/결정 문서 해시와 프로세스 상세는 summary JSON에 있습니다. 제품 소스·설치·git 쓰기를 수행하지 않았습니다. 모든 worker의 시작·종료 HEAD는 4d2e54533이며 외부 HEAD 변경은 없었습니다. 이전 세션 53개 및 이번 수정 전 84개 부분 표본을 모두 폐기했으며, 검증 ON 재현 실행의 표본도 공식 수치에 포함하지 않았습니다.\n`;

if (process.argv.includes('--check')) {
  assert.equal(manifest.status, 'official');
  assert.equal(aFailures.length, 0, 'Validation A failed');
  assert.deepEqual(manifest.calibration.bySentinelPasses, calibration.bySentinelPasses);
  assert.deepEqual(manifest.validation.a, summary.validation.a);
  assert.deepEqual(manifest.validation.b, summary.validation.b);
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(),
    '4d2e54533dc8feaccb4742be9dd322e46d20be58');
  assert.deepEqual(manifest.groupCounts, groupCounts);
  assert.deepEqual(manifest.updateSplitGroupCounts, updateSplitGroupCounts);
  assert.deepEqual(manifest.flipsVs93Corrected, summary.flipsVs93Corrected);
  assert.equal(summary.react.branchless.met, 22); assert.equal(summary.react.expression.met, 2);
  assert.equal(summary.react.updateSplitBranchless.met, 20); assert.equal(summary.react.updateSplitExpression.met, 2);
  assert.equal(officialRows.length, 46); assert.equal(updateSplitRows.length, 46); assert.equal(branchAxisRows.length, 16);
  assert(fs.readFileSync(path.join(output, 'verdict-93c01.md'), 'utf8').includes('95C-01에 의해 코어 공식 용도에서 대체'));
  assert(fs.readFileSync(path.join(output, 'verdict-95c01.md'), 'utf8').includes('95C-01 공식 코어 종단 판정표'));
  assert.equal(execFileSync('git', ['--no-optional-locks', 'diff', '--name-only',
    '5982d51a79c9c5e9e3568d3479d7bf04e242fd52', '--', 'packages/canard/schema-form/src'], { cwd: repo, encoding: 'utf8' }).trim(), '');
  console.log('ARTIFACTS_95C01_OK');
} else if (process.argv.includes('--transport')) {
  console.log(JSON.stringify({ summary: { ...summary, records: undefined, preliminaryProcesses: undefined },
    markdown, recordSourceIds: compactRecords.map(record => record.releaseSourceSet) }));
} else console.log(JSON.stringify({ summary, markdown }));
