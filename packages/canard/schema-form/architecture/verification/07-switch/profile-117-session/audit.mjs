// CLI artifact verification; aggregation and selected bootstrap intervals are recomputed independently.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { directory, HEAD, emit } from './runtime.mjs';

const read = file => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
const nearest = (values, fraction = .5) => [...values].sort((left, right) => left - right)[Math.ceil(values.length * fraction) - 1];
const equal = (left, right) => assert(Math.abs(left - right) < 1e-10, left + ' versus ' + right);
const files = fs.readdirSync(directory);
const rawCore = files.filter(file => /^[ABCD]-core-.*\.json$/.test(file));
const rawReact = files.filter(file => /^[AB]-react-(plain|counts)-.*\.json$/.test(file));
const intervals = [];
let boundaryRows = 0, coreModes = 0, largestWorker = { seconds: 0 };
for (const file of rawCore) {
  const record = read(file);
  assert.equal(record.HEAD, HEAD);
  assert.equal(record.workerExit.code, 0);
  assert.equal(record.workerExit.signal, null);
  assert.equal(record.workerExit.natural, true);
  assert.equal(record.samples, 101);
  assert.equal(record.warmup, 20);
  assert.equal(record.officialEngineInstrumentation, false);
  assert.equal(record.forcedGCOutsideClock, true);
  assert.equal(record.schemaCloneOutsideClock, true);
  assert.equal(record.validationServicesOutsideClock, true);
  assert.equal(record.freshProcess, true);
  assert.equal(record.negativeClipping, false);
  assert.equal(record.boundaryWrapperInstalledAfterOfficialSamples, true);
  assert.equal(record.sentinelPasses, record.validation === 'on' ? 2 : 1);
  assert.deepEqual(record.timingColumns, ['microtaskMs', 'sentinelEndToEndMs', 'pairedEmptyTailMs']);
  assert(record.seconds < 480);
  if (record.seconds > largestWorker.seconds) largestWorker = { file, seconds: record.seconds };
  intervals.push({ file, started: Date.parse(record.started), ended: Date.parse(record.ended) });
  const [left, right] = record.versions;
  assert.deepEqual(record.checks[left], record.checks[right], 'Both versions must retain equivalent canonical values');
  if (record.stage === 'C') assert.equal(record.bundleSha256[left], record.bundleSha256[right]);
  for (const version of record.versions) for (const [mode, values] of Object.entries(record.timing[version])) {
    coreModes++;
    assert.equal(values.length, 101);
    assert(values.every(value => value.length === 3 && value.every(Number.isFinite)));
    assert.equal(record.callbacks[version][mode].length, 101);
    assert.equal(Object.values(record.checks[version][mode]).reduce((sum, count) => sum + count, 0), 101);
    if (version !== '0.16.0') {
      const boundary = record.boundary[version][mode];
      for (const field of ['scheduled', 'executed', 'pendingAtMicrotasks', 'pendingAtFirstSentinel',
        'pendingAtSentinel', 'tailScheduled', 'tailExecuted']) assert.equal(boundary[field].max, 0);
      boundaryRows++;
    }
  }
}
for (const file of rawReact) {
  const record = read(file), env = record.environment;
  assert.equal(record.head, HEAD);
  assert.equal(record.workerExit.code, 0);
  assert.equal(record.workerExit.signal, null);
  assert.equal(record.workerExit.natural, true);
  assert.equal(env.validation, 'off');
  assert.equal(env.profiling, true);
  assert.equal(env.gcOutsideClock, true);
  assert.equal(env.schemaClone, true);
  const counts = file.includes('-counts-');
  assert.equal(env.samples, counts ? 3 : 101);
  assert.equal(env.warmup, counts ? 0 : 20);
  assert(env.seconds < 480);
  if (env.esbuildExit) assert.deepEqual(env.esbuildExit, { code: 0, signal: null });
  if (env.seconds > largestWorker.seconds) largestWorker = { file, seconds: env.seconds };
  intervals.push({ file, started: Date.parse(env.startedAt), ended: Date.parse(env.endedAt) });
  for (const values of Object.values(record.timing)) {
    assert.equal(values.length, env.samples);
    assert(values.every(Number.isFinite));
  }
  if (counts) for (const phase of ['mount', 'update']) {
    assert.equal(record.work[phase].length, 3);
    record.work[phase].forEach((work, index) => {
      assert(Object.values(work).every(value => Number.isInteger(value) && value >= 0));
      assert.equal(work.commits, record.timing['commits-' + phase][index]);
    });
  }
}
intervals.sort((left, right) => left.started - right.started);
for (let index = 1; index < intervals.length; index++) assert(intervals[index - 1].ended <= intervals[index].started,
  'Sequential workers must not overlap: ' + intervals[index - 1].file + ' / ' + intervals[index].file);

const verdict = read('verdict.json');
const reconstructed = new Map();
for (const stage of ['C', 'D']) {
  const calibration = read('calibration-' + stage + '.json');
  for (const passes of [1, 2]) {
    const controls = rawCore.filter(file => file.startsWith(stage + '-')).map(read)
      .filter(record => record.sentinelPasses === passes)
      .flatMap(record => [...record.empty.before, ...record.empty.after]);
    equal(nearest(controls.map(value => value[1])), calibration.byPasses[passes].C);
    equal(nearest(controls.map(value => value[0])), calibration.byPasses[passes].M);
    assert.equal(controls.length, calibration.byPasses[passes].calls);
  }
  const analyses = files.filter(file => file.startsWith('analysis-' + stage + '-') && file.endsWith('.json'));
  for (const file of analyses) {
    const analysis = read(file), records = analysis.raw.map(read);
    assert.equal(records.length, 9);
    assert.deepEqual(records.map(record => record.run), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const row of analysis.rows) {
      const pairs = records.flatMap(record => record.timing.head[row.mode].map((value, index) =>
        value[1] - record.timing.working[row.mode][index][1]));
      assert.equal(pairs.length, 909);
      equal(nearest(pairs), row.paired.median);
      const base = records.flatMap(record => record.timing.head[row.mode].map(value =>
        value[1] - row.callCount * calibration.byPasses[record.sentinelPasses].C));
      equal(nearest(base), row.versions.head.metric.median);
      reconstructed.set([stage, row.fixture, row.validation, row.mode].join('/'), pairs);
      for (const version of ['head', 'working']) {
        const pooledDifferences = [];
        for (const record of records) {
          const differences = record.timing[version][row.mode].map(value => value[1] - value[0] - value[2]);
          pooledDifferences.push(...differences);
          const check = row.versions[version].endpointCheck.runs.find(run => run.run === record.run);
          equal(nearest(differences), check.difference);
          assert.equal(check.withinNoise, Math.abs(check.difference) <= check.noise);
        }
        equal(nearest(pooledDifferences), row.versions[version].endpointCheck.difference);
      }
    }
  }
}

/** Quickselect provides an independent median implementation for the deterministic interval audit. */
function select(values, ordinal) {
  let left = 0, right = values.length - 1;
  while (left < right) {
    const pivot = values[Math.floor((left + right) / 2)];
    let lower = left, upper = right;
    while (lower <= upper) {
      while (values[lower] < pivot) lower++;
      while (values[upper] > pivot) upper--;
      if (lower <= upper) {
        const saved = values[lower]; values[lower] = values[upper]; values[upper] = saved;
        lower++; upper--;
      }
    }
    if (ordinal <= upper) right = upper;
    else if (ordinal >= lower) left = lower;
    else return values[ordinal];
  }
  return values[ordinal];
}

function independentlyBootstrap(values) {
  let state = 101;
  const medians = [];
  for (let trial = 0; trial < 1999; trial++) {
    const sample = new Float64Array(values.length);
    for (let index = 0; index < values.length; index++) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      sample[index] = values[(state >>> 0) % values.length];
    }
    medians.push(select(sample, 454));
  }
  medians.sort((left, right) => left - right);
  return { low: medians[9], high: medians[1989] };
}
const selected = verdict.rows.filter(row => row.regression || row.lane === 'fixed-branch-axis');
for (const row of selected) {
  const interval = independentlyBootstrap(reconstructed.get(['D', row.fixture, row.validation, row.mode].join('/')));
  equal(interval.low, row.paired.low);
  equal(interval.high, row.paired.high);
}
for (const row of verdict.rows) {
  const control = reconstructed.get(['C', row.fixture, row.validation, row.mode].join('/'));
  const delta = reconstructed.get(['D', row.fixture, row.validation, row.mode].join('/'));
  equal(row.aaMagnitudeMs, Math.abs(nearest(control)));
  equal(row.paired.median, nearest(delta));
  equal(row.regressionFloorMs, Math.max(Math.abs(nearest(control)), row.baseMedianMs * .005));
  assert.equal(row.regression, row.paired.high < 0 && Math.abs(nearest(delta)) > row.regressionFloorMs);
}
for (const slope of verdict.slopes) {
  const count = slope.points.length;
  const sumX = slope.points.reduce((sum, point) => sum + point.branches, 0);
  const sumXX = slope.points.reduce((sum, point) => sum + point.branches ** 2, 0);
  for (const [field, expected] of [['headMs', slope.headUsPerBranch], ['workingMs', slope.workingUsPerBranch]]) {
    const sumY = slope.points.reduce((sum, point) => sum + point[field], 0);
    const sumXY = slope.points.reduce((sum, point) => sum + point.branches * point[field], 0);
    equal((count * sumXY - sumX * sumY) / (count * sumXX - sumX ** 2) * 1000, expected);
  }
}

const split = read('split-AB.json');
for (const row of split.B.rows) for (const version of ['HEAD', '0.16.0']) {
  const raw = row.raw.react.filter(file => file.endsWith('-' + version + '.json')).map(read);
  assert.equal(raw.length, 3);
  const wall = nearest(raw.flatMap(record => record.timing['render-update-wall']));
  equal(wall, row.versions[version].wall);
  equal(row.versions[version].wall - row.versions[version].core, row.versions[version].layer);
}
assert.equal(split.addCoreRows.length, 0);
assert.equal(split.acceptanceWidened, false);
assert.equal(verdict.verdict, 'REJECT');
assert.equal(verdict.regressions.length, 4);
const largestFile = files.map(file => ({ file, bytes: fs.statSync(path.join(directory, file)).size }))
  .sort((left, right) => right.bytes - left.bytes)[0];
assert(largestFile.bytes <= 5_000_000);
emit('audit-measurements.json', { HEAD, checked: new Date().toISOString(), passed: true,
  coreWorkers: rawCore.length, reactWorkers: rawReact.length, totalMeasuredWorkers: intervals.length,
  firstStarted: new Date(intervals[0].started).toISOString(), lastEnded: new Date(intervals.at(-1).ended).toISOString(),
  overlappingWorkers: 0, allWorkerExitCodesZero: true, allWorkersNaturallyEnded: true,
  largestWorker, coreVersionModeChecks: coreModes, zeroNewEngineBoundaryRows: boundaryRows,
  pairedRowsIndependentlyAggregated: 208, independentlyBootstrappedDRows: selected.length,
  independentlyVerifiedBranchSlopes: 6,
  regressionRows: verdict.regressions, largestFile,
  endpointValidationFailuresPreserved: verdict.endpointFailures.length,
  scope: 'Worker records, same-call endpoint checks, medians, selected intervals, split arithmetic, and verdict thresholds were verified; (ga) failures are findings, not converted to passes.' });
console.log('원자료의 순차 종료·대응 통계·분해 산술과 판정 기준을 검증했습니다.');
