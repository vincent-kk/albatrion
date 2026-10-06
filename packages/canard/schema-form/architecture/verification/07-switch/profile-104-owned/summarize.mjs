// CLI evidence aggregation; reuse the 95C-01 noise gate without choosing a favorable run.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..');
const repo = path.resolve(pkg, '../../..');
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';
const operations = [
  ['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'], ['sample-0', 'mount'],
  ['sample-0', 'first'], ['sample-0', 'later'], ['nested-d5-f4', 'first'], ['nested-d5-f4', 'later'],
  ['oneOf-40', 'first'], ['oneOf-40', 'later'],
];
const read = file => JSON.parse(fs.readFileSync(path.join(directory, file + '.json'), 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length / 2) - 1];
const started = Date.now();

/** Return the canonical deterministic 1999-trial median bootstrap and its 99% error bound. */
function bootstrap(values) {
  let state = 101;
  const medians = [];
  for (let trial = 0; trial < 1999; trial++) {
    if (trial % 100 === 0) assert(Date.now() - started < 420000, 'Split aggregation before eight minutes');
    const sample = [];
    for (let i = 0; i < values.length; i++) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      sample.push(values[(state >>> 0) % values.length]);
    }
    medians.push(median(sample));
  }
  medians.sort((a, b) => a - b);
  const center = median(values);
  return {
    center,
    ci95: [medians[49], medians[1949]],
    error99: Math.max(Math.abs(medians[9] - center), Math.abs(medians[1989] - center)),
  };
}

const builds = Object.fromEntries(['head', 'control', 'working', 'working-dev'].map(version => {
  const row = read('build-' + version);
  assert.equal(row.HEAD, HEAD);
  assert.equal(row.bundleSha256, sha(fs.readFileSync(path.join(bundles, 'owned104-' + version + '.cjs'))));
  assert.equal(row.naturalBuildServices, 1);
  return [version, row];
}));
assert.equal(builds.head.bundleSha256, builds.control.bundleSha256);
assert.equal(builds.head.sourceTreeSha256, builds.control.sourceTreeSha256);
for (const [file, hash] of Object.entries(builds.working.sources)) {
  assert.equal(sha(fs.readFileSync(path.join(repo, file))), hash, 'The measured product source must remain unchanged: ' + file);
}
assert.equal(execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), HEAD);

const windows = [];
const timerDrivers = [];
/** Validate one naturally terminating fresh worker and count GC events that began inside its clocks. */
function validate(row, regime, name, mode, run) {
  assert.equal(row.HEAD, HEAD);
  assert.equal(row.regime, regime);
  assert.equal(row.name, name);
  assert.equal(row.mode, mode);
  assert.equal(row.run, run);
  assert.equal(row.freshProcess, true);
  assert.equal(row.warmup, 20);
  assert.equal(row.samples, 101);
  assert.equal(row.timingsMs.head.length, 101);
  assert.equal(row.timingsMs.working.length, 101);
  assert.equal(row.pairedDeltasMs.length, 101);
  assert.equal(row.emptyTimingsMs.before.length, 101);
  assert.equal(row.emptyTimingsMs.after.length, 101);
  assert.equal(row.windows.length, 202);
  assert.equal(row.observations.head, row.observations.working);
  assert.equal(row.bundleSha256.head, builds.head.bundleSha256);
  assert.equal(row.bundleSha256.working, builds[regime.startsWith('noise') ? 'control' : 'working'].bundleSha256);
  assert.equal(row.forcedGCOutsideClock, regime !== 'steady');
  assert.equal(row.firstOrder, run % 2 ? 'head' : 'working');
  assert(row.elapsedMs < 480000);
  assert.equal(row.headMs, median(row.timingsMs.head) - row.empty);
  assert.equal(row.workingMs, median(row.timingsMs.working) - row.empty);
  for (let i = 0; i < 101; i++) {
    const first = regime === 'steady' ? row.firstOrder : (i + run - 1) % 2 ? 'working' : 'head';
    assert.equal(row.windows[i * 2].version, first);
    assert.equal(row.windows[i * 2 + 1].version, first === 'head' ? 'working' : 'head');
    assert.equal(row.windows[i * 2].index, i);
    assert.equal(row.windows[i * 2 + 1].index, i);
  }
  const inside = row.gc.filter(event => row.windows.some(window => event.start >= window.begin && event.start < window.end));
  if (regime !== 'steady') assert.equal(inside.filter(event => event.kind === 4).length, 0, 'Forced major GC must stay outside clocks');
  const file = `${regime}-${name}-${mode}-r${run}`;
  const process = read(`process-pair-${regime}-${name}-${mode}-${run}-${regime.startsWith('noise') ? 'control' : 'working'}`);
  assert.equal(process.status, 0);
  assert.equal(process.signal, null);
  timerDrivers.push(process.driverSha256);
  windows.push([row.started, row.ended, file]);
  return { inside, file: file + '.json' };
}

const timing = [];
for (const [name, mode] of operations) {
  const controls = [];
  for (const regime of ['noise-before', 'noise-after']) for (const run of [1, 2, 3]) {
    const row = read(`${regime}-${name}-${mode}-r${run}`);
    const checked = validate(row, regime, name, mode, run);
    controls.push({ regime, run, headMs: row.headMs, workingMs: row.workingMs,
      gainMs: row.headMs - row.workingMs, pairedMedianMs: median(row.pairedDeltasMs), file: checked.file });
  }
  const noOpNoiseMs = Math.max(...controls.flatMap(row => [Math.abs(row.gainMs), Math.abs(row.pairedMedianMs)]));
  const records = [1, 2, 3].map(run => read(`forced-${name}-${mode}-r${run}`));
  const runs = records.map(row => {
    const checked = validate(row, 'forced', name, mode, row.run);
    const residuals = [...row.emptyTimingsMs.before, ...row.emptyTimingsMs.after]
      .map(value => Math.abs(value - row.empty)).sort((a, b) => a - b);
    const headError = bootstrap(row.timingsMs.head).error99;
    const workingError = bootstrap(row.timingsMs.working).error99;
    const noiseMs = Math.max(.001, noOpNoiseMs, residuals[Math.ceil(residuals.length * .95) - 1] + headError + workingError);
    const paired = bootstrap(row.pairedDeltasMs);
    const gainMs = row.headMs - row.workingMs;
    return { run: row.run, headMs: row.headMs, workingMs: row.workingMs, gainMs,
      pairedMedianMs: paired.center, pairedCi95: paired.ci95, noiseMs, emptyMs: row.empty,
      headError99Ms: headError, workingError99Ms: workingError,
      improvementBeyondNoise: gainMs > noiseMs, regressionBeyondNoise: gainMs < -noiseMs,
      gcInside: checked.inside.length, file: checked.file };
  });
  const paired = bootstrap(records.flatMap(row => row.pairedDeltasMs));
  const steadyRecords = [1, 2, 3, 4, 5, 6].map(run => read(`steady-${name}-${mode}-r${run}`));
  const steadyRuns = steadyRecords.map(row => {
    const checked = validate(row, 'steady', name, mode, row.run);
    const gc = version => checked.inside.filter(event => row.windows.some(window => window.version === version && event.start >= window.begin && event.start < window.end));
    const hgc = gc('head'), wgc = gc('working');
    return { run: row.run, firstOrder: row.firstOrder, headMs: row.headMs, workingMs: row.workingMs,
      emptyMs: row.empty, gcInside: { head: hgc.length, working: wgc.length },
      gcPauseInsideMs: { head: hgc.reduce((s, e) => s + e.ms, 0), working: wgc.reduce((s, e) => s + e.ms, 0) }, file: checked.file };
  });
  assert.equal(steadyRuns.filter(row => row.firstOrder === 'head').length, 3);
  assert.equal(steadyRuns.filter(row => row.firstOrder === 'working').length, 3);
  const steadyHeadMs = median(steadyRecords.flatMap(row => row.timingsMs.head.map(value => value - row.empty)));
  const steadyWorkingMs = median(steadyRecords.flatMap(row => row.timingsMs.working.map(value => value - row.empty)));
  timing.push({ name, mode, headMs: median(runs.map(row => row.headMs)), workingMs: median(runs.map(row => row.workingMs)),
    gainMs: median(runs.map(row => row.gainMs)), gainRunRangeMs: [Math.min(...runs.map(row => row.gainMs)), Math.max(...runs.map(row => row.gainMs))],
    pairedMedianMs: paired.center, pooledPairedCi95: paired.ci95, noOpNoiseMs, maxNoiseMs: Math.max(...runs.map(row => row.noiseMs)),
    aboveNoise: runs.every(row => row.improvementBeyondNoise), regressionBeyondNoise: runs.some(row => row.regressionBeyondNoise),
    runs, controls, steady: { samplesPerEngine: 606, headMs: steadyHeadMs, workingMs: steadyWorkingMs,
      gainMs: steadyHeadMs - steadyWorkingMs, runs: steadyRuns } });
}

windows.sort((a, b) => a[0] - b[0]);
for (let i = 1; i < windows.length; i++) assert(windows[i][0] >= windows[i - 1][1], 'Timer worker processes must run sequentially');
assert.equal(windows.length, 150);
assert.equal(timerDrivers.every(hash => hash === timerDrivers[0]), true);
const processes = fs.readdirSync(directory).filter(file => file.startsWith('process-') && file.endsWith('.json'))
  .map(file => ({ file, ...read(file.slice(0, -5)) }));
assert(processes.every(row => row.signal === null && row.status === 0 && row.elapsedMs < 480000));
const freezeCounts = [];
const expected = { 'nested-d5-f4': [1365, 3071, 30372], 'flat-500': [501, 1003, 11024], 'oneOf-20': [63, 116, 1569], 'sample-0': [3, 8, 69] };
for (const [name, [nodes, production, development]] of Object.entries(expected)) for (const mode of ['production', 'development']) {
  const row = read(`count-working-${name}${mode === 'development' ? '-dev' : ''}`);
  assert.equal(row.nodes, nodes);
  assert.equal(row.distinct, mode === 'production' ? production : development);
  assert.equal(row.repeatCalls, 0);
  assert.equal(row.primitives, 0);
  if (mode === 'production') assert.equal(row.completed, 0);
  freezeCounts.push(row);
}
const improvements = timing.filter(row => row.aboveNoise).map(row => `${row.name}/${row.mode}`);
const regressions = timing.filter(row => row.regressionBeyondNoise).map(row => `${row.name}/${row.mode}`);
const checks = Object.fromEntries(['development', 'owned', 'production', 'typecheck', 'lint', 'legacy'].map(name => [name, read('check-' + name)]));
const artifactSizes = fs.readdirSync(directory).filter(file => fs.statSync(path.join(directory, file)).isFile())
  .map(file => ({ file, bytes: fs.statSync(path.join(directory, file)).size }));
assert(artifactSizes.every(row => row.bytes <= 5_000_000));
const fixture = path.join(pkg, 'src/core/blueprint/__tests__/fixtures/ownedInlineHead.json');
const fixtureBytes = fs.readFileSync(fixture);
const fixtureRecord = JSON.parse(fixtureBytes);
assert.equal(fixtureRecord.head, HEAD);
assert.equal(fixtureRecord.cases.length, 59);
assert(fixtureRecord.cases.every(row => row.captures.length === 2));
assert.equal(sha(fixtureBytes), 'c776022c70bbf36c3e60258108dfcf0b9df6d97b6b518772e47270899004799a');
const summary = {
  HEAD, created: new Date().toISOString(), kept: improvements.length > 0 && regressions.length === 0, improvements, regressions, stopPoints: [],
  protocol: { name: '95C-01', warmup: 20, samples: 101, forcedRuns: 3, freshProcess: true,
    alternatingEachPair: true, forcedGCOutsideClock: true, checkpointCount: 64,
    endpoint: 'setImmediate sentinel 안', calibratedBy: '앞뒤 각 101 empty drain의 합친 중앙값',
    noise: 'max(0.001 ms, 전후 HEAD/HEAD 대조 6회의 최대 |gain| 및 |paired median|, empty residual p95 + 양쪽 중앙값 bootstrap 99% 오차)',
    improvement: '3회 모두 gain > 자기 noise', regression: '한 회라도 gain < -자기 noise',
    pairedCi95: '303 paired delta의 표본 bootstrap 구간; 프로세스 간 일반화 구간이 아님',
    steady: '6회, HEAD 먼저 3회 및 후보 먼저 3회, 엔진별 보정 표본 606개를 전부 합친 중앙값; 유지 판정에 사용하지 않음' },
  bundles: Object.fromEntries(Object.entries(builds).map(([key, row]) => [key, { ...row, sources: undefined }])),
  fixture: { file: 'src/core/blueprint/__tests__/fixtures/ownedInlineHead.json', bytes: fixtureBytes.length, sha256: sha(fixtureBytes), captures: 118, schemas: 59 },
  timing, freezeCounts, checks,
  validation: { timerProcesses: windows.length, measuredPairs: windows.length * 101,
    maxTimerProcessElapsedMs: Math.max(...windows.map(([begin, end]) => end - begin)),
    processRecords: processes.length, maxRecordedProcessElapsedMs: Math.max(...processes.map(row => row.elapsedMs)),
    maxCheckElapsedMs: Math.max(...Object.values(checks).map(row => row.elapsedMs)),
    signals: 0, sequentialTimers: true, forcedMajorGcInsideClocks: 0, headControlByteIdentical: true, measuredSourcesUnchanged: true,
    timerDriverSha256: timerDrivers[0], largestArtifact: artifactSizes.toSorted((a, b) => b.bytes - a.bytes)[0] },
};
const text = JSON.stringify(summary, null, 2) + '\n';
assert(Buffer.byteLength(text) <= 5_000_000);
fs.writeFileSync(path.join(directory, 'summary.json'), text);
console.log(JSON.stringify({ kept: summary.kept, improvements, regressions, validation: summary.validation }));
for (const row of timing) console.log(JSON.stringify({ name: row.name, mode: row.mode,
  verdict: [row.headMs, row.workingMs], delta: row.gainMs, noise: row.maxNoiseMs,
  paired: row.pairedMedianMs, ci95: row.pooledPairedCi95, improvement: row.aboveNoise, regression: row.regressionBeyondNoise,
  steadyPooled: [row.steady.headMs, row.steady.workingMs] }));
