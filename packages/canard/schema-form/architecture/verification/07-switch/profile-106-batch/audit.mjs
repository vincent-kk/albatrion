// CLI audit binds measurements, source bytes, independent patches and final verification.
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
const HEAD = '552a975abd8afa6ef914e218832bd8bfddf03d5b';
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name + '.json'), 'utf8'));
const git = args => execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', ...args],
  { cwd: repo, encoding: 'utf8', maxBuffer: 5_000_000 });
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length / 2) - 1];
assert.equal(git(['rev-parse', 'HEAD']).trim(), HEAD);
const stages = ['AA', '1-gate-reads', '2-selection', '3-empty-fragments', '4-first-delivery'];
const measuredEnvironment = read('AA-forced-nested-d5-f4-mount-r1').environment;
const names = ['head', 'control', 'candidate-1', 'base-2', 'candidate-2', 'base-3', 'candidate-3', 'base-4', 'candidate-4'];
const builds = Object.fromEntries(names.map(name => [name, read('build-' + name)]));
for (const [name, build] of Object.entries(builds)) {
  assert.equal(build.HEAD, HEAD);
  assert.equal(build.naturalBuildServices, 1);
  assert.equal(build.bundleSha256, sha(fs.readFileSync(path.join(bundles, `batch106-${name}.cjs`))));
}
for (const [before, after] of [['head', 'control'], ['candidate-1', 'base-2'], ['candidate-1', 'base-3'], ['candidate-3', 'base-4']]) {
  assert.equal(builds[before].sourceTreeSha256, builds[after].sourceTreeSha256);
  assert.equal(builds[before].bundleSha256, builds[after].bundleSha256);
}
const sites = ['settle/utils/gates/evaluateGate.ts', 'settle/utils/compute/selectChildren.ts',
  'blueprint/utils/analyze/collectDeclarations.ts', 'record/utils/SchemaNodeRevisionLedger.ts'];
const bases = ['head', 'base-2', 'base-3', 'base-4'];
for (let index = 0; index < sites.length; index++) {
  const base = builds[bases[index]].sources;
  const candidate = builds['candidate-' + (index + 1)].sources;
  assert.deepEqual(Object.keys(base).sort(), Object.keys(candidate).sort());
  assert.deepEqual(Object.keys(candidate).filter(file => candidate[file] !== base[file]),
    ['packages/canard/schema-form/src/core/' + sites[index]]);
}
for (const [file, hash] of Object.entries(builds['candidate-3'].sources))
  assert.equal(sha(fs.readFileSync(path.join(repo, file))), hash, file);
for (const number of ['2', '4']) {
  const snapshot = read(`base-${number}-files`);
  for (const [file, before] of Object.entries(snapshot)) {
    const target = path.join(repo, file);
    assert.equal(fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null, before, file);
  }
}
const workers = [], drivers = [], summaries = {};
let gcInside = 0, majorGCInside = 0;
for (let phase = 0; phase < stages.length; phase++) {
  const stage = stages[phase];
  const summary = read('summary-' + stage);
  summaries[stage] = summary;
  for (const pooled of summary.rows) {
    const deltas = [];
    for (let run = 1; run <= 9; run++) {
      const row = read(`${stage}-forced-${pooled.name}-${pooled.mode}-r${run}`);
      assert(!row.environment.execPath.includes('bun'));
      assert.equal(row.environment.node, measuredEnvironment.node);
      assert.equal(row.environment.v8, measuredEnvironment.v8);
      assert.equal(row.environment.execPath, measuredEnvironment.execPath);
      assert.equal(row.samples, 101);
      assert.equal(row.warmup, 20);
      assert.equal(row.freshProcess, true);
      assert.equal(row.forcedGCOutsideClock, true);
      const base = phase === 0 ? 'head' : bases[phase - 1];
      const candidate = phase === 0 ? 'control' : 'candidate-' + phase;
      assert.equal(row.bundleSha256.head, builds[base].bundleSha256);
      assert.equal(row.bundleSha256.working, builds[candidate].bundleSha256);
      assert.equal(row.observations.head, row.observations.working);
      assert.equal(row.windows.length, 202);
      for (let index = 0; index < 101; index++) {
        assert.equal(row.pairedDeltasMs[index], row.timingsMs.head[index] - row.timingsMs.working[index]);
        assert.equal(row.windows[index * 2].version, (index + run - 1) % 2 ? 'working' : 'head');
        assert.equal(row.windows[index * 2 + 1].version, (index + run - 1) % 2 ? 'head' : 'working');
        assert.equal(row.windows[index * 2].index, index);
        assert.equal(row.windows[index * 2 + 1].index, index);
      }
      const inside = row.gc.filter(event => row.windows.some(window => event.start >= window.begin && event.start < window.end));
      gcInside += inside.length;
      majorGCInside += inside.filter(event => event.kind === 4).length;
      const worker = read(`${stage}-process-pair-forced-${pooled.name}-${pooled.mode}-${run}-${candidate}`);
      assert.equal(worker.status, 0);
      assert.equal(worker.signal, null);
      assert(worker.elapsedMs < 480000);
      workers.push({ phase, stage, ...worker });
      deltas.push(...row.pairedDeltasMs);
    }
    assert.equal(deltas.length, 909);
    assert.equal(median(deltas), pooled.pooledMedianMs);
    const driver = read(`driver-${stage}-${pooled.name}-${pooled.mode}`);
    assert.equal(driver.status, 0);
    assert.equal(driver.signal, null);
    assert(driver.elapsedMs < 480000);
    drivers.push(driver);
    if (phase) {
      const aa = summaries.AA.rows.find(row => row.name === pooled.name && row.mode === pooled.mode).pooledMedianMs;
      assert.equal(pooled.aaMedianMs, aa);
      assert.equal(pooled.floorMs, pooled.baseMedianMs * 0.005);
      assert.equal(pooled.improved, pooled.ci99Ms[0] > 0 && pooled.pooledMedianMs > aa);
      assert.equal(pooled.regression, pooled.ci99Ms[1] < 0 && Math.abs(pooled.pooledMedianMs) > Math.max(Math.abs(aa), pooled.floorMs));
    }
  }
}
workers.sort((a, b) => a.started - b.started);
assert.equal(workers.length, 450);
for (let index = 1; index < workers.length; index++) {
  assert(workers[index].started >= workers[index - 1].ended);
  assert(workers[index].phase >= workers[index - 1].phase);
}
assert.equal(summaries['1-gate-reads'].adopted, true);
assert.equal(summaries['2-selection'].adopted, false);
assert.equal(summaries['3-empty-fragments'].adopted, true);
assert.equal(summaries['4-first-delivery'].adopted, false);
const checks = Object.fromEntries(['development', 'production', 'typecheck', 'lint', 'legacy'].map(kind =>
  [kind, read('check-final-' + kind)]));
for (const [kind, check] of Object.entries(checks)) {
  assert.equal(check.signal, null);
  assert(check.elapsedMs < 480000);
  assert.equal(check.exitCode, kind === 'development' ? 1 : 0);
}
const failures = checks.development.summary.filter(line => line.startsWith(' FAIL '));
assert.equal(failures.length, 4);
for (const project of ['render', 'react18']) {
  const rows = failures.filter(line => line.includes('|' + project + '|'));
  assert.equal(rows.length, 2);
  assert(rows.every(line => line.includes('EVENT-070 React stops two fields writing back through')));
  assert(rows.some(line => line.endsWith('useEffect')));
  assert(rows.some(line => line.endsWith('useLayoutEffect')));
}
const supportCommands = fs.readdirSync(directory).filter(name => /^(?:process-build-|check-).*\.json$/.test(name))
  .map(name => ({ name, ...JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')) }));
for (const command of supportCommands) {
  assert.equal(command.signal, null);
  assert(command.elapsedMs < 480000);
}
const cpuCommands = [...workers, ...supportCommands].sort((a, b) => a.started - b.started);
for (let index = 1; index < cpuCommands.length; index++)
  assert(cpuCommands[index].started >= cpuCommands[index - 1].ended, 'Build/test overlapped a worker');
const patches = [];
for (const [number, name] of [['1', '1-gate-reads.patch'], ['3', '3-empty-fragments.patch']]) {
  const snapshot = read(`base-${number}-files`);
  const patch = fs.readFileSync(path.join(directory, name), 'utf8');
  const chunks = patch.split('diff --git ').slice(1);
  const reconstructed = {};
  for (const chunk of chunks) {
    const lines = chunk.split('\n');
    const file = lines[0].split(' ')[0].slice(2);
    assert(file in snapshot);
    const original = (snapshot[file] ?? '').split(/(?<=\n)/).filter(Boolean);
    const output = [];
    let cursor = 0, active = false;
    for (let index = 1; index < lines.length; index++) {
      const line = lines[index];
      const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
      if (hunk) {
        const position = Number(hunk[1]) === 0 ? 0 : Number(hunk[1]) - 1;
        assert(position >= cursor);
        output.push(...original.slice(cursor, position));
        cursor = position;
        active = true;
      } else if (active && (line.startsWith(' ') || line.startsWith('-'))) {
        assert.equal(original[cursor++], line.slice(1) + '\n', file);
        if (line.startsWith(' ')) output.push(line.slice(1) + '\n');
      } else if (active && line.startsWith('+')) output.push(line.slice(1) + '\n');
    }
    output.push(...original.slice(cursor));
    reconstructed[file] = output.join('');
    assert.equal(reconstructed[file], fs.readFileSync(path.join(repo, file), 'utf8'), file);
  }
  assert.deepEqual(Object.keys(reconstructed).sort(), Object.keys(snapshot).sort());
  patches.push({ number, name, sha256: sha(patch), files: Object.keys(reconstructed), independentApplication: true });
}
const bootstrap = path.resolve(directory, '../profile-104-owned/summarize.mjs');
assert.equal(sha(fs.readFileSync(bootstrap)), sha(git(['show', HEAD + ':' + path.relative(repo, bootstrap)])));
const fixture = 'packages/canard/schema-form/src/core/blueprint/__tests__/fixtures/ownedInlineHead.json';
assert.equal(sha(fs.readFileSync(path.join(repo, fixture))), sha(git(['show', HEAD + ':' + fixture])));
const tracked = git(['diff', '--name-only', '--', 'packages/canard/schema-form/src']).trim().split('\n').filter(Boolean);
assert.deepEqual(tracked.sort(), [
  'packages/canard/schema-form/src/core/settle/DETAIL.md', 'packages/canard/schema-form/src/core/settle/utils/gates/evaluateGate.ts',
  'packages/canard/schema-form/src/core/blueprint/DETAIL.md', 'packages/canard/schema-form/src/core/blueprint/utils/analyze/collectDeclarations.ts',
].sort());
const files = [];
function collectFiles(root) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) collectFiles(target);
    else files.push({ path: path.relative(directory, target), bytes: fs.statSync(target).size });
  }
}
collectFiles(directory);
assert(files.every(file => file.bytes <= 5_000_000));
assert(files.every(file => !/\.(cjs|map|tsbuildinfo)$|cache/i.test(file.path)));
for (const root of [repo, pkg]) {
  const cache = path.join(root, 'node_modules/.vite');
  assert(fs.lstatSync(cache).isSymbolicLink());
  assert(fs.realpathSync(cache).startsWith(bundles + '/'));
}
const output = { HEAD, adopted: [1, 3], rejected: [2, 4], STOP: [], patches, checks,
  environment: { ...measuredEnvironment, cpu: os.cpus()[0].model, platform: process.platform, arch: process.arch },
  audit: { workers: workers.length, pairs: 45450, rowCommands: drivers.length,
    naturalExit: true, sequential: true, runtimeSourcesMatch: true, rejectedFullyRestored: true,
    maximumWorkerMs: Math.max(...workers.map(row => row.elapsedMs)),
    maximumRowMs: Math.max(...drivers.map(row => row.elapsedMs)),
    maximumCheckMs: Math.max(...Object.values(checks).map(row => row.elapsedMs)),
    supportCommands: supportCommands.length, maximumRecordedCommandMs: Math.max(...cpuCommands.map(row => row.elapsedMs)),
    artifactMaxBytes: Math.max(...files.map(file => file.bytes)), gcInside, majorGCInside,
    invalidLauncherWorkers: 18, invalidLauncherDirectory: 'invalid-bun',
    developmentRpcTimeoutMs: 300000, developmentNaturalElapsedMs: checks.development.elapsedMs,
    started: workers[0].started, ended: workers.at(-1).ended } };
fs.writeFileSync(path.join(directory, 'audit.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ ...output, checks: Object.fromEntries(Object.entries(checks).map(([kind, row]) =>
  [kind, { exitCode: row.exitCode, elapsedMs: row.elapsedMs, summary: row.summary.filter(line => /Test Files|Tests |Duration |LEGACY_ISOLATED|^ FAIL /.test(line)) }])) }));
