// CLI audit and 105C-01 aggregation; raw paired differences remain in bounded JSON files.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..');
const repo = path.resolve(pkg, '../../..');
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const HEAD = '5e8f34625b64b84dddd58239f31969afb71c862c';
const started = Date.now();
const sha = value => createHash('sha256').update(value).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name + '.json'), 'utf8'));
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length / 2) - 1];
const operations = [
  ['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'], ['sample-0', 'mount'],
  ['sample-0', 'first'], ['sample-0', 'later'], ['nested-d5-f4', 'first'], ['nested-d5-f4', 'later'],
  ['oneOf-40', 'first'], ['oneOf-40', 'later'],
];
const labels = { mount: '마운트', first: '첫 업데이트', later: '후속 업데이트' };
const git = args => execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', ...args],
  { cwd: repo, encoding: 'utf8', maxBuffer: 5_000_000 });
assert.equal(git(['rev-parse', 'HEAD']).trim(), HEAD);

/** Reuse the canonical deterministic 1999-trial bootstrap and expose its 99% endpoints. */
const canonicalFile = path.resolve(directory, '../profile-104-owned/summarize.mjs');
const canonical = fs.readFileSync(canonicalFile, 'utf8');
assert.equal(sha(canonical), sha(git(['show', HEAD + ':' + path.relative(repo, canonicalFile)])));
const begin = canonical.indexOf('function bootstrap(values)');
const end = canonical.indexOf('\nconst builds =', begin);
assert(begin >= 0 && end > begin);
const bootstrapSource = canonical.slice(begin, end)
  .replace('ci95: [medians[49], medians[1949]],',
    'ci95: [medians[49], medians[1949]], ci99: [medians[9], medians[1989]],');
assert(bootstrapSource.includes('ci99:'));
const bootstrap = new Function('assert', 'started', 'median', bootstrapSource + '\nreturn bootstrap;')(assert, started, median);

const builds = {};
for (const candidate of ['AA', 'P', 'C']) {
  builds[candidate] = {};
  for (const version of ['head', candidate === 'AA' ? 'control' : 'working']) {
    const file = candidate === 'C'
      ? path.resolve(directory, '../profile-105-rebound/child105-build-' + version + '.json')
      : path.join(directory, 'power106-' + candidate + '-build-' + version + '.json');
    const record = JSON.parse(fs.readFileSync(file, 'utf8'));
    const bundle = path.join(bundles, candidate === 'C' ? 'child105-' + version + '.cjs'
      : 'power106-' + candidate + '-' + version + '.cjs');
    assert.equal(record.HEAD, HEAD);
    assert.equal(record.naturalBuildServices, 1);
    assert.equal(record.bundleSha256, sha(fs.readFileSync(bundle)));
    for (const [source, expected] of Object.entries(record.sources)) {
      const scratch = path.join(bundles, 'path106-scratch', source);
      const bytes = candidate === 'C' && version === 'working' ? fs.readFileSync(path.join(repo, source))
        : candidate === 'P' && version === 'working' && fs.existsSync(scratch) ? fs.readFileSync(scratch)
        : git(['show', HEAD + ':' + source]);
      assert.equal(sha(bytes), expected, source);
    }
    builds[candidate][version] = { file: path.relative(directory, file),
      sourceTreeSha256: record.sourceTreeSha256, bundleSha256: record.bundleSha256, bytes: record.bytes };
  }
}
assert.equal(builds.AA.head.bundleSha256, builds.AA.control.bundleSha256);
assert.equal(builds.AA.head.sourceTreeSha256, builds.AA.control.sourceTreeSha256);
assert.equal(builds.AA.head.sourceTreeSha256, builds.P.head.sourceTreeSha256);
assert.equal(builds.AA.head.sourceTreeSha256, builds.C.head.sourceTreeSha256);
assert.equal(builds.AA.head.bundleSha256, builds.P.head.bundleSha256);
const executableText = file => fs.readFileSync(file, 'utf8').split('\n').filter(line => !/^\s*\/\//.test(line)).join('\n');
assert.equal(sha(executableText(path.join(bundles, 'power106-AA-head.cjs'))),
  sha(executableText(path.join(bundles, 'child105-head.cjs'))), 'HEAD bundles may differ only in comment lines');

const timerProcesses = [], rowDrivers = [], rows = [];
let gcInside = 0, majorGCInside = 0;
for (const candidate of ['AA', 'P', 'C']) {
  for (const [name, mode] of operations) {
    const deltas = [], records = [], runMedians = [];
    for (let run = 1; run <= 9; run++) {
      const comparator = candidate === 'AA' ? 'control' : 'working';
      const file = (candidate === 'AA' ? '' : 'power106-' + candidate + '-') + `forced-${name}-${mode}-r${run}`;
      const row = read(file);
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
      assert.equal(row.firstOrder, run % 2 ? 'head' : 'working');
      assert.equal(row.emptyTimingsMs.before.length, 101);
      assert.equal(row.emptyTimingsMs.after.length, 101);
      assert.equal(row.timingsMs.head.length, 101);
      assert.equal(row.timingsMs.working.length, 101);
      assert.equal(row.pairedDeltasMs.length, 101);
      assert.equal(row.observations.head, row.observations.working);
      assert.equal(row.bundleSha256.head, builds[candidate].head.bundleSha256);
      assert.equal(row.bundleSha256.working, builds[candidate][comparator].bundleSha256);
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
      const processRecord = read(`power106-${candidate}-process-pair-forced-${name}-${mode}-${run}-${comparator}`);
      assert.equal(processRecord.HEAD, HEAD);
      assert.equal(processRecord.status, 0);
      assert.equal(processRecord.signal, null);
      assert(processRecord.elapsedMs < 480000);
      assert(row.elapsedMs < 480000);
      const adapter = candidate === 'AA' ? 'measure-AA.mjs' : 'measure.mjs';
      assert.equal(processRecord.driverSha256, sha(fs.readFileSync(path.join(directory, adapter))));
      timerProcesses.push({ candidate, name, mode, run, ...processRecord });
      deltas.push(...row.pairedDeltasMs);
      records.push(row);
      runMedians.push(median(row.pairedDeltasMs));
    }
    assert.equal(deltas.length, 909);
    const pooled = bootstrap(deltas);
    const driver = read(`driver-${candidate}-${name}-${mode}`);
    assert.equal(driver.status, 0);
    assert.equal(driver.signal, null);
    assert(driver.elapsedMs < 480000);
    rowDrivers.push(driver);
    rows.push({ candidate, name, mode, samples: 909, pooledMedianMs: pooled.center, ci99Ms: pooled.ci99,
      runPairedMedianMs: runMedians, headPooledMs: median(records.flatMap(row => row.timingsMs.head.map(v => v - row.empty))),
      workingPooledMs: median(records.flatMap(row => row.timingsMs.working.map(v => v - row.empty))),
      observation: records[0].observations.head });
    assert(records.every(row => row.observations.head === records[0].observations.head));
  }
}
assert.equal(majorGCInside, 0);
timerProcesses.sort((a, b) => a.started - b.started);
for (let index = 1; index < timerProcesses.length; index++)
  assert(timerProcesses[index].started >= timerProcesses[index - 1].ended);
assert.equal(timerProcesses.length, 270);
assert.equal(timerProcesses.slice(0, 90).every(row => row.candidate === 'AA'), true);
assert.equal(timerProcesses.slice(90, 180).every(row => row.candidate === 'P'), true);
assert.equal(timerProcesses.slice(180).every(row => row.candidate === 'C'), true);

const verdicts = {};
for (const candidate of ['AA', 'P', 'C']) {
  for (const row of rows.filter(row => row.candidate === candidate)) {
    const aa = rows.find(other => other.candidate === 'AA' && other.name === row.name && other.mode === row.mode);
    assert.equal(row.observation, aa.observation);
    row.aaMedianMs = aa.pooledMedianMs;
    row.aaCi99Ms = aa.ci99Ms;
    row.improved = candidate !== 'AA' && row.ci99Ms[0] > 0 && row.pooledMedianMs > row.aaMedianMs;
    row.regression = candidate !== 'AA' && row.ci99Ms[1] < 0;
    row.verdict = candidate === 'AA' ? '대조 통계' : row.regression ? '회귀' : row.improved ? '개선' : '채택 조건 미충족';
  }
  if (candidate === 'AA') continue;
  const candidateRows = rows.filter(row => row.candidate === candidate);
  const improvements = candidateRows.filter(row => row.improved).map(row => [row.name, row.mode]);
  const regressions = candidateRows.filter(row => row.regression).map(row => [row.name, row.mode]);
  verdicts[candidate] = { adopted: improvements.length > 0 && regressions.length === 0, improvements, regressions };
}

const buildProcesses = fs.readdirSync(directory).filter(file => /^power106-(AA|P)-process-build-/.test(file))
  .map(file => ({ file, ...JSON.parse(fs.readFileSync(path.join(directory, file))) }));
assert.equal(buildProcesses.length, 4);
assert(buildProcesses.every(row => row.status === 0 && row.signal === null && row.elapsedMs < 480000));
const allWorkers = [...timerProcesses, ...buildProcesses].sort((a, b) => a.started - b.started);
for (let index = 1; index < allWorkers.length; index++) assert(allWorkers[index].started >= allWorkers[index - 1].ended);
const summary = { HEAD, decision: '105C-01', date: new Date().toISOString(),
  design: { runs: 9, warmup: 20, samplesPerRun: 101, pooledPairsPerRow: 909,
    bootstrapTrials: 1999, bootstrapSeed: 101, interval: '99% percentile, canonical endpoints 9/1989',
    adopt: 'pooled 99% 하한 > 0 및 pooled 중앙값 > 같은 행 A/A pooled 중앙값; 회귀 행 없음',
    regression: 'pooled 99% 상한 < 0', statistic: '9회 909개 H−W 짝 차이의 pooled 중앙값; 회차 중앙값의 중앙값 아님' },
  environment: { node: process.version, v8: process.versions.v8, platform: process.platform,
    arch: process.arch, cpu: os.cpus()[0].model, mode: 'production' },
  builds, rows, verdicts, audit: { timerProcesses: 270, pairedSamples: 27270, rowCommands: 30,
    sessionBuilds: 4, naturalBuildServices: 4, sequential: true, naturalExit: true,
    majorGCInside, gcInside, maximumTimerMs: Math.max(...timerProcesses.map(row => row.elapsedMs)),
    maximumRowCommandMs: Math.max(...rowDrivers.map(row => row.elapsedMs)),
    maximumBuildMs: Math.max(...buildProcesses.map(row => row.elapsedMs)),
    started: allWorkers[0].started, ended: allWorkers.at(-1).ended,
    summaryElapsedMs: Date.now() - started,
    originalChildBundlesReused: true, aaMeasuredOnce: true,
    candidatePatchSha256: sha(fs.readFileSync(path.resolve(directory, '../profile-105-rebound/path105-candidate-product.patch'))),
    canonicalSummarizerSha256: sha(canonical) } };
const output = JSON.stringify(summary, null, 2) + '\n';
assert(Buffer.byteLength(output) <= 5_000_000);
fs.writeFileSync(path.join(directory, 'summary.json'), output);
const fmt = value => value.toFixed(6);
for (const candidate of ['AA', 'P', 'C']) {
  console.log('TABLE ' + candidate);
  console.log('| fixture / 작업 | pooled 중앙값 ms | 99% 구간 ms | A/A 중앙값 ms | 판정 |');
  console.log('| --- | ---: | --- | ---: | --- |');
  for (const row of rows.filter(row => row.candidate === candidate))
    console.log(`| ${row.name} ${labels[row.mode]} | ${fmt(row.pooledMedianMs)} | [${fmt(row.ci99Ms[0])}, ${fmt(row.ci99Ms[1])}] | ${fmt(row.aaMedianMs)} | ${row.verdict} |`);
}
console.log(JSON.stringify({ verdicts, audit: summary.audit, environment: summary.environment }));

