// CLI reporter: preserves historical samples and changes only calibration A's statistic.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { endpointDifference95c01 } from '../tools/endpointDifference95c01.mjs';

const work = path.dirname(fileURLToPath(import.meta.url)), D = path.dirname(work);
const started = Date.now();
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = text => createHash('sha256').update(text).digest('hex');
const q = (values, p) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * p) - 1];
const median = values => q(values, .5);
const metric = values => ({ median: median(values), p99: q(values, .99), samples: values.length });
const near = (actual, expected) => assert(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);
const rowKey = row => `${row.fixture}/${row.validation ?? 'off'}/${row.mode}`;
const valid = a => a.withinNoise && a.allRunsWithinNoise;

function bootstrap(values, seed) {
  let state = seed >>> 0;
  const estimates = [];
  for (let trial = 0; trial < 1000; trial++) {
    const sample = [];
    for (let i = 0; i < values.length; i++) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      sample.push(values[Math.floor(state / 4294967296 * values.length)]);
    }
    estimates.push(median(sample));
    assert(Date.now() - started < 420_000, 'Split reporter commands');
  }
  const center = median(values), low = q(estimates, .005), high = q(estimates, .995);
  return { low, high, halfWidth: Math.max(center - low, high - center), resamples: 1000, seed };
}

function calibrate(records) {
  const empty = records.flatMap(r => [...r.timings['empty-before'], ...r.timings['empty-after']]);
  const waiting = empty.map(x => x[1] - x[0]), waitMedian = median(waiting);
  const C = median(empty.map(x => x[1])), M = median(empty.map(x => x[0]));
  return { C, M, wait: C - M, emptyNoise: q(waiting.map(x => Math.abs(x - waitMedian)), .95),
    emptyEndCi: bootstrap(empty.map(x => x[1]), 9501),
    emptyMicroCi: bootstrap(empty.map(x => x[0]), 9502), emptyCalls: empty.length };
}

function assess(sentinel, expected, callCount, calibration, seeds) {
  const { emptyNoise, emptyEndCi, emptyMicroCi } = calibration;
  const sentinelCi = bootstrap(sentinel, seeds[0]), expectedCi = bootstrap(expected, seeds[1]);
  const noiseMs = Math.max(.001, callCount * emptyNoise + sentinelCi.halfWidth + expectedCi.halfWidth +
    callCount * (emptyEndCi.halfWidth + emptyMicroCi.halfWidth));
  const before = median(sentinel) - median(expected);
  const after = endpointDifference95c01(sentinel, expected);
  return { before: { differenceMs: before, noiseMs, withinNoise: Math.abs(before) <= noiseMs },
    after: { differenceMs: after, noiseMs, withinNoise: Math.abs(after) <= noiseMs },
    bootstrap99: { sentinel: sentinelCi, expected: expectedCi } };
}

function evaluateVersion(records, mode, calibration, version) {
  const callCount = mode === 'update' ? records[0].summary.interactionCount : 1;
  const runs = [1, 2, 3].map(run => {
    const t = records.find(r => r.summary.run === run && r.summary.version === version).timings;
    const sentinel = t[mode].map(x => x[1] - calibration.C * callCount);
    const microtask = t[mode].map(x => x[0] - calibration.M * callCount);
    const callback = t[mode + '-callback'], sum = microtask.map((x, i) => x + callback[i]);
    const expected = version === 'new' ? microtask : sum;
    return { run, sentinel, microtask, sum,
      assessment: assess(sentinel, expected, callCount, calibration, [run * 100 + 95, run * 100 + 96]) };
  });
  const pooled = Object.fromEntries(['sentinel', 'microtask', 'sum'].map(key => [key, runs.flatMap(r => r[key])]));
  const expected = version === 'new' ? pooled.microtask : pooled.sum;
  const assessment = assess(pooled.sentinel, expected, callCount, calibration, [9593, 9594]);
  const fallback = version === 'old' && (!assessment.before.withinNoise || runs.some(r => !r.assessment.before.withinNoise));
  const selected = fallback ? 'sum' : 'sentinel';
  const before = { ...assessment.before, allRunsWithinNoise: runs.every(r => r.assessment.before.withinNoise),
    runs: runs.map(r => ({ run: r.run, ...r.assessment.before })) };
  const after = version === 'new' ? { ...assessment.after,
    allRunsWithinNoise: runs.every(r => r.assessment.after.withinNoise),
    runs: runs.map(r => ({ run: r.run, ...r.assessment.after })) } : before;
  return { callCount, fallback, column: fallback ? '(나) microtask + callback 합' : '종단',
    metric: metric(pooled[selected]), runMetrics: runs.map(r => metric(r[selected])),
    sentinel: metric(pooled.sentinel), microtask: metric(pooled.microtask), before, after };
}

function evaluate(records, mode, calibration) {
  const current = evaluateVersion(records, mode, calibration, 'new');
  const old = evaluateVersion(records, mode, calibration, 'old');
  const ratio = current.metric.median / old.metric.median;
  const runRatios = current.runMetrics.map((m, i) => m.median / old.runMetrics[i].median);
  const tie = runRatios.some(x => x <= 1.5) && runRatios.some(x => x > 1.5);
  const numericalVerdict = tie ? '충족(동률)' : ratio <= 1.5 ? '충족' : '미달';
  const verdict = a => valid(a) ? numericalVerdict : '보류((가) 미통과)';
  return { fixture: records[0].summary.fixture, validation: records[0].summary.validation, mode,
    callCount: current.callCount, ratio, runRatios, tie, target: 1.5, numericalVerdict,
    aBefore: current.before, aAfter: current.after, verdictBefore: verdict(current.before),
    verdictAfter: verdict(current.after), new: { metric: current.metric, runMetrics: current.runMetrics },
    old: { metric: old.metric, runMetrics: old.runMetrics, column: old.column, fallback: old.fallback, before: old.before } };
}

function changed(row) {
  return row.aBefore.withinNoise !== row.aAfter.withinNoise ||
    row.aBefore.runs.some((r, i) => r.withinNoise !== row.aAfter.runs[i].withinNoise) ||
    row.verdictBefore !== row.verdictAfter;
}

function loadRecords(folder, fixture, validation = 'off') {
  return [1, 2, 3].flatMap(run => ['old', 'new'].map(version =>
    read(path.join(folder, `official-${fixture}-${validation}-r${run}-${version}.json`))));
}

function verifyHistorical(row, saved) {
  near(row.ratio, saved.ratio);
  row.runRatios.forEach((value, i) => near(value, saved.runRatios[i]));
  for (const [key, version] of [['aBefore', 'new'], ['old', 'old']]) {
    const actual = key === 'old' ? row.old.before : row.aBefore, expected = saved[version].validation;
    near(actual.differenceMs, expected.differenceMs);
    near(actual.noiseMs, expected.noiseMs);
    assert.equal(actual.withinNoise, expected.withinNoise);
    assert.equal(actual.allRunsWithinNoise, expected.allRunsWithinNoise);
    actual.runs.forEach((r, i) => {
      near(r.differenceMs, saved[version].runs[i].differenceMs);
      near(r.noiseMs, saved[version].runs[i].noiseMs);
      assert.equal(r.withinNoise, saved[version].runs[i].withinNoise);
    });
  }
}

function historical() {
  const previous = read(path.join(D, 'profile-108-ratios-summary.json'));
  const cal108 = read(path.join(D, 'profile-108-ratios/calibration.json')).byValidation;
  const previous109 = read(path.join(D, 'profile-109-update/official-summary.json'));
  const cache = new Map(), all = [];
  for (const saved of previous.rows) {
    const key = `${saved.fixture}/${saved.validation}`;
    if (!cache.has(key)) cache.set(key, loadRecords(path.join(D, 'profile-108-ratios'), saved.fixture, saved.validation));
    const row = evaluate(cache.get(key), saved.mode, cal108[saved.validation]);
    verifyHistorical(row, saved);
    all.push({ source: 'profile-108-ratios', ...row, acceptanceStatus: saved.acceptanceStatus });
  }
  const records109 = ['flat-100', 'array-100'].flatMap(f => loadRecords(path.join(D, 'profile-109-update'), f));
  for (const saved of previous109.rows) {
    const row = evaluate(records109.filter(r => r.summary.fixture === saved.fixture), saved.mode, previous109.calibration);
    verifyHistorical(row, saved);
    all.push({ source: 'profile-109-update', ...row });
  }
  assert.equal(all.length, 89);
  const latest = all.slice(0, 83).map(row => all.find(r => r.source === 'profile-109-update' && rowKey(r) === rowKey(row)) ?? row);
  assert.equal(latest.length, 83);
  const inputs = [...cache.values()].flat().concat(records109);
  const reference = row => ({ source: row.source, key: rowKey(row) });
  return { historicalRows: all, latestOfficialRows: latest.map(reference), historicalChanges: all.filter(changed).map(reference),
    latestOfficialChanges: latest.filter(changed).map(reference), calibration108: cal108, calibration109: previous109.calibration,
    unchangedRatioAndOldColumn: true, oldStatisticReproducedAgainstSavedSummaries: true,
    numericDifferenceChangedRows: all.filter(r => Math.abs(r.aBefore.differenceMs - r.aAfter.differenceMs) > 1e-12).length,
    inputWorkers: inputs.length, elapsedMs: Date.now() - started };
}

function fresh() {
  const records = ['array-100', 'flat-100'].flatMap(f => loadRecords(work, f));
  const calibration = calibrate(records);
  const requested = [['array-100', 'update'], ['array-100', 'update-first'], ['flat-100', 'update-first']];
  const rows = requested.map(([fixture, mode]) => ({ ...evaluate(records.filter(r => r.summary.fixture === fixture), mode, calibration),
    acceptanceStatus: fixture === 'array-100' ? '소유자 수용(104라운드)' : '비수용 행 — 1.5× 판정' }));
  const chronological = records.toSorted((a, b) => Date.parse(a.summary.environment.started) - Date.parse(b.summary.environment.started));
  chronological.forEach((r, i) => {
    const s = r.summary;
    assert.equal(s.environment.head, '61e97d3664b03010339f793d5f44741345894c96');
    assert.equal(s.warmup, 20); assert.equal(s.sampleCount, 101); assert.equal(s.explicitGc, true);
    assert.equal(s.officialEngineInstrumentation, false); assert.equal(s.externalSubscribers, 0);
    assert.equal(s.onChange, 'noop'); assert.equal(s.sentinelPasses, 1);
    assert.equal(s.boundaryWrapperInstalledAfterOfficialSamples, true);
    assert.equal(s.workerExit.code, 0); assert.equal(s.workerExit.signal, null); assert.equal(s.workerExit.natural, true);
    assert(s.workerExit.elapsedMs < 480_000 && s.serviceExits.length > 0);
    assert(s.serviceExits.every(x => x.code === 0 && x.signal === null));
    assert(Object.values(r.timings).every(t => t.length === 101));
    for (const [mode, values] of Object.entries(r.timings).filter(([m]) => !m.endsWith('-callback')))
      near(s.endpointTailMs[mode], endpointDifference95c01(values.map(x => x[1]), values.map(x => x[0])));
    for (const order of Object.values(s.ordering)) {
      assert.equal(order.pendingAtSentinel.p99, 0); assert.equal(order.tailScheduled.p99 + order.tailExecuted.p99, 0);
      if (s.version === 'new') assert.equal(order.scheduled.p99, 0);
    }
    if (i) assert(Date.parse(s.environment.started) > Date.parse(chronological[i - 1].summary.environment.ended));
  });
  for (const fixture of ['array-100', 'flat-100']) for (const run of [1, 2, 3]) {
    const pair = records.filter(r => r.summary.fixture === fixture && r.summary.run === run);
    assert.deepEqual(pair[0].summary.checks, pair[1].summary.checks);
    if (fixture === 'array-100') pair.forEach(r => assert.deepEqual(r.timings.update, r.timings['update-first']));
    const expectedOrder = run === 2 ? ['new', 'old'] : ['old', 'new'];
    assert.deepEqual(pair.toSorted((a, b) => Date.parse(a.summary.environment.started) - Date.parse(b.summary.environment.started))
      .map(r => r.summary.version), expectedOrder);
  }
  return { calibration, rows, processCount: records.length, concurrency: 1,
    started: chronological[0].summary.environment.started, ended: chronological.at(-1).summary.environment.ended,
    records: chronological.map(({ summary: s }) => ({ fixture: s.fixture, validation: s.validation,
      run: s.run, version: s.version, environment: s.environment, workerExit: s.workerExit,
      serviceExits: s.serviceExits, bundleEvidence: s.bundleEvidence, toolSha256: s.toolSha256,
      sourceSha256: s.sourceSha256, adaptedSourceSha256: s.adaptedSourceSha256,
      releaseSourcesSha256: hash(JSON.stringify(s.releaseSources)),
      timingFile: `profile-110-calibration/official-${s.fixture}-${s.validation}-r${s.run}-${s.version}.json` })),
    elapsedMs: Date.now() - started };
}

const command = process.argv[2];
if (command === '--historical') console.log(JSON.stringify(historical()));
else if (command === '--fresh') console.log(JSON.stringify(fresh()));
else assert.fail('Use --historical or --fresh');
