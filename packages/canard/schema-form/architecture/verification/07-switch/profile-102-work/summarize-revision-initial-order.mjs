// Invoked after all balanced-order workers finish; reads only this repeat's evidence.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const prefix = 'revision102-order-';
const read = name => JSON.parse(fs.readFileSync(path.join(directory, prefix + name + '.json'), 'utf8'));
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length / 2) - 1];
const original = fs.readFileSync(path.join(directory, 'revision-initial-empty.mjs'), 'utf8');
const errorStart = original.indexOf('function medianError(values) {');
const errorEnd = original.indexOf('\n/** Compare every column', errorStart);
assert(errorStart >= 0 && errorEnd > errorStart);
// The canonical driver owns the deterministic 1,999-trial bootstrap estimator.
const medianError = new Function('median', original.slice(errorStart, errorEnd) + '\nreturn medianError;')(median);

const headBuild = read('build-head'), controlBuild = read('build-control'), workingBuild = read('build-working');
assert.equal(headBuild.head, '926671834');
assert.equal(headBuild.sha256, controlBuild.sha256);
assert.notEqual(headBuild.sha256, workingBuild.sha256);
for (const build of [headBuild, controlBuild, workingBuild]) assert.equal(build.naturalServiceExits, 1);

const controls = Array.from({ length: 6 }, (_, index) => read(`control-oneOf-20-mount-steady-r${index + 1}`));
const positions = ['H-first', 'W-first'].map(blockOrder => {
  const rows = controls.filter(row => row.blockOrder === blockOrder);
  assert.equal(rows.length, 3);
  return { blockOrder, firstPenaltyMs: rows.map(row => blockOrder === 'H-first' ? row.gainMs : -row.gainMs),
    maxFirstPenaltyMs: Math.max(...rows.map(row => Math.abs(row.gainMs))),
    maxAbsoluteOrdinalDeltaMs: Math.max(...rows.map(row => Math.abs(row.pairedMedianMs))) };
});
const noOpNoiseMs = Math.max(...controls.flatMap(row => [Math.abs(row.gainMs), Math.abs(row.pairedMedianMs)]));
const allRows = [...controls];

/** Summarize corrected raw samples and same-position control matches without remeasurement. */
function summarize(name, regime, runs) {
  const rows = Array.from({ length: runs }, (_, index) => read(`working-${name}-mount-${regime}-r${index + 1}`));
  allRows.push(...rows);
  const controlNoiseMs = name === 'oneOf-20' && regime === 'steady' ? noOpNoiseMs : 0;
  const measurements = rows.map(row => {
    const residuals = [...row.emptyTimingsMs.before, ...row.emptyTimingsMs.after].map(value => Math.abs(value - row.empty));
    const residualP95 = residuals.toSorted((a, b) => a - b)[Math.ceil(residuals.length * .95) - 1];
    const noiseMs = Math.max(.001, controlNoiseMs, residualP95 + medianError(row.timingsMs.head) + medianError(row.timingsMs.variant));
    const deltas = row.pairedDeltasMs.toSorted((a, b) => a - b);
    const gcInside = row.gc.filter(event => row.windows.some(window => event.start >= window.begin && event.start < window.end));
    if (regime === 'forced') assert.equal(gcInside.filter(event => event.kind === 4).length, 0);
    assert.deepEqual(row.observation.head, row.observation.variant);
    assert.equal(row.calls.head, 121); assert.equal(row.calls.variant, 121);
    const samePosition = positions.find(position => position.blockOrder === row.blockOrder);
    return { run: row.run, blockOrder: row.blockOrder, headMs: row.headMs, workingMs: row.workingMs,
      gainMs: row.gainMs, pairedMedianMs: row.pairedMedianMs, noiseMs,
      ordinalCentralIntervalMs: [deltas[40], deltas[60]], gcInside: gcInside.length,
      samePositionControlMaxMs: name === 'oneOf-20' && regime === 'steady' ? samePosition.maxFirstPenaltyMs : null,
      samePositionMatched: name === 'oneOf-20' && regime === 'steady' ?
        Math.max(0, -row.gainMs) <= samePosition.maxFirstPenaltyMs : null };
  });
  const pooledH = rows.flatMap(row => row.timingsMs.head.map(value => value - row.empty));
  const pooledW = rows.flatMap(row => row.timingsMs.variant.map(value => value - row.empty));
  const pooledHeadMs = median(pooledH), pooledWorkingMs = median(pooledW);
  const residuals = rows.flatMap(row => [...row.emptyTimingsMs.before, ...row.emptyTimingsMs.after].map(value => Math.abs(value - row.empty)));
  const pooledNoiseMs = Math.max(.001, controlNoiseMs,
    residuals.toSorted((a, b) => a - b)[Math.ceil(residuals.length * .95) - 1] + medianError(pooledH) + medianError(pooledW));
  return { name, regime, runs, samples: pooledH.length, pooledHeadMs, pooledWorkingMs,
    pooledGainMs: pooledHeadMs - pooledWorkingMs,
    pooledOrdinalDeltaMs: median(rows.flatMap(row => row.pairedDeltasMs)), pooledNoiseMs,
    everyRunImproved: measurements.every(row => row.gainMs > 0),
    everyRunAboveNoise: measurements.every(row => row.gainMs > row.noiseMs && row.ordinalCentralIntervalMs[0] > 0),
    pooledNotSlowerBeyondNoise: pooledHeadMs - pooledWorkingMs >= -pooledNoiseMs, measurements };
}

const rows = ['oneOf-20', 'nested-d5-f4', 'flat-500', 'sample-0'].flatMap(name =>
  ['forced', 'steady'].map(regime => summarize(name, regime, name === 'oneOf-20' ? 6 : 3)));
const oneOf = rows.filter(row => row.name === 'oneOf-20');
const mounts = rows.filter(row => ['nested-d5-f4', 'flat-500'].includes(row.name));
const unmatched = oneOf.find(row => row.regime === 'steady').measurements.filter(row => !row.samePositionMatched);
const kept = mounts.every(row => row.everyRunImproved) && oneOf.every(row => row.pooledNotSlowerBeyondNoise) && !unmatched.length;
const windows = allRows.map(row => [row.started, row.ended]).toSorted((a, b) => a[0] - b[0]);
for (let index = 1; index < windows.length; index++) assert(windows[index - 1][1] <= windows[index][0]);
const processes = fs.readdirSync(directory).filter(name => name.startsWith(prefix + 'process-')).map(name => read(name.slice(prefix.length, -5)));
for (const process of processes) {
  assert.equal(process.status, 0); assert.equal(process.signal, null);
  assert.equal(process.naturalExit, true); assert(process.elapsedMs < 480_000);
}
const evidenceFiles = fs.readdirSync(directory).filter(name => name.startsWith(prefix));
const maxFileBytes = Math.max(...evidenceFiles.map(name => fs.statSync(path.join(directory, name)).size));
assert(maxFileBytes <= 5_000_000);
const verification = ['vitest', 'tsc', 'eslint', 'legacy'].map(name => read('verify-' + name));
for (const check of verification) {
  assert.equal(check.signal, null); assert.equal(check.naturalExit, true);
  assert(check.elapsedMs < 480_000);
  assert.equal(check.status, check.name === 'vitest' ? 1 : 0);
}
const vitestLog = fs.readFileSync(path.join(directory, prefix + 'verify-vitest.log'), 'utf8');
const failures = vitestLog.split('\n').filter(line => /^ FAIL /.test(line));
assert.equal(failures.length, 4);
for (const project of ['render', 'react18']) for (const effect of ['useLayoutEffect', 'useEffect'])
  assert.equal(failures.filter(line => line.includes(`|${project}|`) &&
    line.endsWith('EVENT-070 React stops two fields writing back through ' + effect)).length, 1);
const verdict = { head: '926671834', kept,
  rule: 'Nested/flat gains must hold in both columns; pooled oneOf must not be slower beyond noise; every slower steady run must fit the raw A/A magnitude in the same first-block position.',
  noiseRule: 'max(1us, same-column A/A absolute median/ordinal delta if measured, empty residual p95 + canonical 1999-trial 99% bootstrap median-error sum); no forced A/A was requested.',
  builds: [headBuild, controlBuild, workingBuild], controls: { noOpNoiseMs, positions,
    runs: controls.map(({ run, blockOrder, headMs, workingMs, gainMs, pairedMedianMs }) => ({ run, blockOrder, headMs, workingMs, gainMs, pairedMedianMs })) },
  unmatched, rows, verification, audit: { timingWorkers: windows.length, overlap: 0,
    maxWorkerMs: Math.max(...windows.map(([start, end]) => end - start)),
    maxCommandMs: Math.max(...processes.map(process => process.elapsedMs)), maxFileBytes,
    maxCommandIncludingVerificationMs: Math.max(...processes.map(process => process.elapsedMs), ...verification.map(check => check.elapsedMs)),
    successfulNaturallyExitedProcesses: processes.length } };
const output = JSON.stringify(verdict, null, 2) + '\n';
assert(Buffer.byteLength(output) <= 5_000_000);
fs.writeFileSync(path.join(directory, prefix + 'verdict.json'), output);
console.log(JSON.stringify({ kept, controls: verdict.controls, unmatched, rows, audit: verdict.audit }));
