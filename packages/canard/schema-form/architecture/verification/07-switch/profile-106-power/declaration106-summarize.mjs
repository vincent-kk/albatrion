// CLI audit: preserve the canonical seeded bootstrap and audit all paired clock windows.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..');
const repo = path.resolve(pkg, '../../..');
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const HEAD = 'fb99a2d09012de744c3ab3e58e571d1fd8d87e4b';
const prefix = 'declaration106-';
const started = Date.now();
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(directory, prefix + name + '.json'), 'utf8'));
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length / 2) - 1];
const git = args => execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', ...args],
  { cwd: repo, encoding: 'utf8', maxBuffer: 5_000_000 });
assert.equal(git(['rev-parse', 'HEAD']).trim(), HEAD);
const canonicalFile = path.resolve(directory, '../profile-104-owned/summarize.mjs');
const canonical = fs.readFileSync(canonicalFile, 'utf8');
assert.equal(sha(canonical), sha(git(['show', HEAD + ':' + path.relative(repo, canonicalFile)])));
const begin = canonical.indexOf('function bootstrap(values)');
const end = canonical.indexOf('\nconst builds =', begin);
assert(begin >= 0 && end > begin);
const bootstrapSource = canonical.slice(begin, end).replace('ci95: [medians[49], medians[1949]],',
  'ci95: [medians[49], medians[1949]], ci99: [medians[9], medians[1989]],');
assert(bootstrapSource.includes('ci99:'));
const bootstrap = new Function('assert', 'started', 'median', bootstrapSource + '\nreturn bootstrap;')(assert, started, median);
const operations = [
  ['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'], ['sample-0', 'mount'],
  ['sample-0', 'first'], ['sample-0', 'later'], ['nested-d5-f4', 'first'], ['nested-d5-f4', 'later'],
  ['oneOf-40', 'first'], ['oneOf-40', 'later'],
];
const builds = {};
const workers = [];
for (const version of ['head', 'control', 'working']) {
  const build = read('build-' + version);
  assert.equal(build.HEAD, HEAD);
  assert.equal(build.naturalBuildServices, 1);
  assert.equal(build.bundleSha256, sha(fs.readFileSync(path.join(bundles, prefix + version + '.cjs'))));
  const changed = [];
  for (const [file, hash] of Object.entries(build.sources)) {
    const head = sha(git(['show', HEAD + ':' + file]));
    if (hash !== head) changed.push(file);
    if (version !== 'working') assert.equal(hash, head, file);
  }
  if (version === 'working') assert.deepEqual(changed.sort(), [
    'packages/canard/schema-form/src/core/blueprint/utils/analyze/buildNodes.ts',
    'packages/canard/schema-form/src/core/blueprint/utils/analyze/collectDeclarations.ts',
  ]);
  builds[version] = { sourceTreeSha256: build.sourceTreeSha256, bundleSha256: build.bundleSha256, bytes: build.bytes, changed };
  workers.push({ phase: 'build', ...read('process-build-' + version) });
}
assert.equal(builds.head.bundleSha256, builds.control.bundleSha256);
assert.equal(builds.head.sourceTreeSha256, builds.control.sourceTreeSha256);
const driverHash = sha(fs.readFileSync(path.join(directory, 'declaration106-measure.mjs')));
const rows = [], drivers = [];
let gcInside = 0, majorGCInside = 0;
for (const phase of ['AA', 'sink']) {
  for (const [name, mode] of operations) {
    const deltas = [], runMedians = [];
    let observation;
    for (let run = 1; run <= 9; run++) {
      const comparator = phase === 'AA' ? 'control' : 'working';
      const row = read(`${phase}-forced-${name}-${mode}-r${run}`);
      assert.equal(row.HEAD, HEAD);
      assert.equal(row.regime, 'forced');
      assert.equal(row.name, name);
      assert.equal(row.mode, mode);
      assert.equal(row.run, run);
      assert.equal(row.comparator, comparator);
      assert.equal(row.freshProcess, true);
      assert.equal(row.forcedGCOutsideClock, true);
      assert.equal(row.warmup, 20);
      assert.equal(row.samples, 101);
      assert.equal(row.windows.length, 202);
      assert.equal(row.emptyTimingsMs.before.length, 101);
      assert.equal(row.emptyTimingsMs.after.length, 101);
      assert.equal(row.pairedDeltasMs.length, 101);
      assert.equal(row.timingsMs.head.length, 101);
      assert.equal(row.timingsMs.working.length, 101);
      assert.equal(row.observations.head, row.observations.working);
      observation ??= row.observations.head;
      assert.equal(row.observations.head, observation);
      assert.equal(row.bundleSha256.head, builds.head.bundleSha256);
      assert.equal(row.bundleSha256.working, builds[comparator].bundleSha256);
      assert.equal(row.headMs, median(row.timingsMs.head) - row.empty);
      assert.equal(row.workingMs, median(row.timingsMs.working) - row.empty);
      for (let index = 0; index < 101; index++) {
        assert.equal(row.pairedDeltasMs[index], row.timingsMs.head[index] - row.timingsMs.working[index]);
        const first = (index + run - 1) % 2 ? 'working' : 'head';
        assert.equal(row.windows[index * 2].version, first);
        assert.equal(row.windows[index * 2 + 1].version, first === 'head' ? 'working' : 'head');
        assert.equal(row.windows[index * 2].index, index);
        assert.equal(row.windows[index * 2 + 1].index, index);
      }
      const inside = row.gc.filter(event => row.windows.some(window => event.start >= window.begin && event.start < window.end));
      gcInside += inside.length;
      majorGCInside += inside.filter(event => event.kind === 4).length;
      const worker = read(`process-pair-forced-${name}-${mode}-${run}-${comparator}`);
      assert.equal(worker.driverSha256, driverHash);
      assert(worker.elapsedMs < 480000);
      assert(row.elapsedMs < 480000);
      workers.push({ phase, name, mode, run, ...worker });
      deltas.push(...row.pairedDeltasMs);
      runMedians.push(median(row.pairedDeltasMs));
    }
    assert.equal(deltas.length, 909);
    const pooled = bootstrap(deltas);
    const driver = read(`driver-${phase}-${name}-${mode}`);
    assert.equal(driver.status, 0);
    assert.equal(driver.signal, null);
    assert(driver.elapsedMs < 480000);
    drivers.push(driver);
    rows.push({ phase, name, mode, pooledMedianMs: pooled.center, ci99Ms: pooled.ci99, runMedians, observation });
  }
}
workers.sort((a, b) => a.started - b.started);
for (let index = 0; index < workers.length; index++) {
  assert.equal(workers[index].status, 0);
  assert.equal(workers[index].signal, null);
  assert(workers[index].elapsedMs < 480000);
  if (index) assert(workers[index].started >= workers[index - 1].ended);
}
const timers = workers.filter(worker => worker.phase !== 'build');
assert.equal(timers.length, 180);
assert(timers.slice(0, 90).every(worker => worker.phase === 'AA'));
assert(timers.slice(90).every(worker => worker.phase === 'sink'));
assert.equal(majorGCInside, 0);
for (const row of rows.filter(row => row.phase === 'sink')) {
  const aa = rows.find(other => other.phase === 'AA' && other.name === row.name && other.mode === row.mode);
  assert.equal(row.observation, aa.observation);
  row.aaMedianMs = aa.pooledMedianMs;
  row.aaCi99Ms = aa.ci99Ms;
  row.improved = row.ci99Ms[0] > 0 && row.pooledMedianMs > aa.pooledMedianMs;
  row.regression = row.ci99Ms[1] < 0;
}
const improvements = rows.filter(row => row.improved).map(row => [row.name, row.mode]);
const regressions = rows.filter(row => row.regression).map(row => [row.name, row.mode]);
const summary = { HEAD, decision: '105C-01', adopted: improvements.length > 0 && regressions.length === 0,
  improvements, regressions, rows, builds,
  design: { runs: 9, warmup: 20, samplesPerRun: 101, pooledPairs: 909, bootstrapTrials: 1999, seed: 101,
    statistic: '9회 909개 H−W 짝 차이의 pooled 중앙값', ci99Indices: [9, 1989] },
  environment: { node: process.version, v8: process.versions.v8, cpu: os.cpus()[0].model, mode: 'production' },
  audit: { timerProcesses: timers.length, pairedSamples: 18180, rowCommands: drivers.length,
    sessionBuilds: 3, sequential: true, naturalExit: true, gcInside, majorGCInside,
    maximumTimerMs: Math.max(...timers.map(worker => worker.elapsedMs)),
    maximumRowMs: Math.max(...drivers.map(driver => driver.elapsedMs)),
    maximumBuildMs: Math.max(...workers.filter(worker => worker.phase === 'build').map(worker => worker.elapsedMs)),
    started: workers[0].started, ended: workers.at(-1).ended, driverHash, canonicalHash: sha(canonical) } };
const output = JSON.stringify(summary, null, 2) + '\n';
assert(Buffer.byteLength(output) < 5_000_000);
fs.writeFileSync(path.join(directory, prefix + 'summary.json'), output);
const fmt = value => value.toFixed(6);
console.log('| 행 | A/A 중앙값 [99% 구간] ms | 후보 중앙값 [99% 구간] ms | 판정 |');
console.log('| --- | --- | --- | --- |');
for (const row of rows.filter(row => row.phase === 'sink'))
  console.log(`| ${row.name} ${row.mode} | ${fmt(row.aaMedianMs)} [${row.aaCi99Ms.map(fmt).join(', ')}] | ${fmt(row.pooledMedianMs)} [${row.ci99Ms.map(fmt).join(', ')}] | ${row.regression ? '회귀' : row.improved ? '개선' : '미입증'} |`);
console.log(JSON.stringify({ adopted: summary.adopted, improvements, regressions, audit: summary.audit }));
