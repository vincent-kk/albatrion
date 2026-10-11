// CLI artifact gate: verifies paired measurements, complete reports, preserved decisions and worktree scope.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url)), D = path.dirname(here);
const repo = path.resolve(D, '../../../../../..');
const read = name => JSON.parse(fs.readFileSync(path.join(here, name), 'utf8'));
const hash = text => createHash('sha256').update(text).digest('hex');
const summary = read('summary.json'), manifest = read('manifest.json'), injected = read('injected-summary.json');
assert.equal(execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), summary.head);
assert.equal(summary.head, '1130bd2f9ff104401cb41bd28c03ab37ffd93d1c');
assert.equal(execFileSync('git', ['--no-optional-locks', 'diff', '--name-only', 'HEAD', '--', 'packages/canard/schema-form/src'], { cwd: repo, encoding: 'utf8' }).trim(), '');
const changed = execFileSync('git', ['--no-optional-locks', 'status', '--porcelain', '--untracked-files=all'], { cwd: repo, encoding: 'utf8' }).split('\n').filter(Boolean);
assert(changed.every(line => line.slice(3).startsWith('packages/canard/schema-form/architecture/verification/07-switch/')));
assert.equal(hash(fs.readFileSync(path.join(D, 'profile-111-final.md'))), summary.preservedOfficialTable.markdownSha256);
assert.equal(hash(JSON.stringify(JSON.parse(fs.readFileSync(path.join(D, 'profile-111-final-summary.json'))))), summary.preservedOfficialTable.summarySha256);
assert.equal(manifest.records.length, 138); assert.equal(manifest.jobs.length, 138);
for (let index = 0; index < manifest.records.length; index++) {
  const record = manifest.records[index], job = manifest.jobs[index];
  assert.deepEqual([record.fixture, record.validation, record.run, record.version], [job.fixture, job.validation, job.run, job.version]);
  assert.equal(record.environment.head, summary.head); assert.equal(record.warmup, 20); assert.equal(record.sampleCount, 101);
  assert.equal(record.sentinelPasses, record.validation === 'on' ? 2 : 1);
  assert.equal(record.officialEngineInstrumentation, false); assert(record.boundaryWrapperInstalledAfterOfficialSamples);
  assert(record.explicitGc); assert.equal(record.externalSubscribers, 0); assert.equal(record.onChange, 'noop');
  assert.equal(record.workerExit.code, 0); assert.equal(record.workerExit.signal, null); assert(record.workerExit.natural);
  assert(record.transportElapsedMs < 480000);
  assert(record.serviceExits.length && record.serviceExits.every(exit => exit.code === 0 && exit.signal === null));
  assert.equal(record.toolSha256, hash(fs.readFileSync(path.join(D, 'tools/measure-verdict-95c01.mjs'))));
  assert.equal(record.timingColumns[2], 'pairedEmptyTailMs');
  const samples = JSON.parse(fs.readFileSync(path.join(D, record.timingFile)));
  assert(Object.values(samples).every(rows => rows.length === 101));
  for (const mode of Object.keys(record.ordering)) {
    assert(samples[mode].every(row => row.length === 3 && row.every(Number.isFinite)));
    if (record.version === 'new') for (const key of ['scheduled', 'executed', 'pendingAtMicrotasks', 'pendingAtSentinel', 'tailScheduled', 'tailExecuted'])
      assert.equal(record.ordering[mode][key].p99, 0);
  }
  if (index) assert(Date.parse(record.environment.started) > Date.parse(manifest.records[index - 1].environment.ended));
}
assert.equal(summary.validation.uniqueRows, 104); assert.equal(summary.validation.displayRows, 108);
assert.equal(summary.validation.passed, 102); assert.equal(summary.validation.arrays.passed, 10);
assert.deepEqual(summary.validation.failedRows, ['array-100/off/update', 'array-100/off/update-first']);
assert.equal(summary.validation.boundaryPassed, 104);
assert.equal(summary.numericalChanges.length, 103); assert.equal(summary.otherNumericalChanges.length, 92);
assert.equal(summary.otherPassChanges.length, 0);
assert.equal(summary.canonicalRowEndToEnd.result, 'CANONICAL_ROW_END_TO_END_OK');
assert(summary.canonicalRowEndToEnd.calibrationPassed);
assert.equal(summary.canonicalRowEndToEnd.key, 'array-500/off/update');
assert.equal(injected.canonicalRowEndToEnd.result, 'INJECTED_CHECK_A_FAILED');
assert(!injected.canonicalRowEndToEnd.checkA.withinNoise && !injected.canonicalRowEndToEnd.checkA.zeroEngineMacrotasks);
assert(injected.canonicalRowEndToEnd.runs.every(run => run.differenceUs > 4900 && !run.withinNoise && !run.zeroEngineMacrotasks));
const report = fs.readFileSync(path.join(D, 'profile-113-paired.md'), 'utf8');
const remeasure = fs.readFileSync(path.join(D, 'remeasure-86c02.md'), 'utf8');
assert(report.includes('## 112라운드 짝 sentinel 꼬리') && remeasure.includes('## 112라운드 짝 sentinel 꼬리'));
for (const row of [...summary.arrays, ...summary.otherNumericalChanges]) assert(report.includes('| ' + row.key + ' |'));
assert(!fs.readFileSync(path.join(D, 'verdict-95c01.md'), 'utf8').includes('preSentinelCalibrationMs'));
for (const name of ['measure-verdict-95c01.mjs', 'report-verdict-95c01.mjs'])
  assert(!fs.readFileSync(path.join(D, 'tools', name), 'utf8').includes('calibrationEnd'));
const files = fs.readdirSync(here), maxBytes = Math.max(...files.map(name => fs.statSync(path.join(here, name)).size));
assert(maxBytes <= 5000000);
assert(!files.some(name => /\.map$|bundle|cache/i.test(name)));
assert.equal(summary.sourceHashes.worker, hash(fs.readFileSync(path.join(D, 'tools/measure-verdict-95c01.mjs'))));
assert.equal(summary.sourceHashes.reporter, hash(fs.readFileSync(path.join(D, 'tools/report-verdict-95c01.mjs'))));
assert.equal(summary.sourceHashes.analyzer, hash(fs.readFileSync(path.join(here, 'analyze-paired.mjs'))));
console.log(JSON.stringify({ result: 'PAIRED_ARTIFACTS_OK', head: summary.head, processes: 138,
  arraysPassed: '10/12', rowsPassed: '102/104', otherNumericalChanges: 92, otherPassChanges: 0,
  injected: injected.canonicalRowEndToEnd.result, files: files.length, maxBytes, maxWorkerMs: summary.audit.maxWorkerMs }));
