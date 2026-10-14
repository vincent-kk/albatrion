/*
 * 사용법(stage-07 루트, /opt/homebrew/bin/node):
 *   node <이 파일> --prepare [--prefix=fap]
 *   node <이 파일> --pair AA array-100 1 [--processes=2] [--warmup=20] [--samples=101] [--old-wait] [--tag=<이름>]
 *   node <이 파일> --pair change array-100 1
 * --prepare는 prepare-react-bundles.mjs로 S/bundles/<prefix>-base.cjs(HEAD 고정), <prefix>-change.cjs(작업 트리),
 * <prefix>-basex.cjs(base + 끝 주석 한 줄)와 <prefix>-bundles.json을 만듭니다.
 * --pair는 측정 프로세스마다 번들 하나만 올립니다. 회차 r의 k번째 블록은 (k + r)이 짝수면 기준→변경,
 * 홀수면 변경→기준 순서로 새 프로세스를 띄우므로(ABBA) 두 쪽의 프로세스 수와 앞선 횟수가 같습니다.
 * AA는 base 대 basex, change는 base 대 change입니다. --old-wait는 drainTicks(2) 대기의 별도 기록 회차입니다.
 * 판정 열은 네 번의 setImmediate 뒤 wall과 같은 구간의 이벤트 루프 활성 시간입니다.
 */
// CLI: --pair spawns fresh `--expose-gc` workers sequentially; each worker loads exactly one bundle.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import { prepareReactBundles } from './prepare-react-bundles.mjs';

const tool = fileURLToPath(import.meta.url);
const directory = path.dirname(tool);
const repo = path.resolve(directory, '../../../../../../..');
const pkg = path.join(repo, 'packages/canard/schema-form');
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad';
const bundles = path.join(scratch, 'bundles');
assert.equal(repo, '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(fs.realpathSync(process.execPath), fs.realpathSync('/opt/homebrew/bin/node'), 'Timing runs use /opt/homebrew/bin/node');
const flag = (name, fallback) => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const prefix = flag('prefix', 'fap');
assert.match(prefix, /^[a-z0-9]+$/);
const warmup = Number(flag('warmup', 20)), samples = Number(flag('samples', 101));
assert(Number.isInteger(warmup) && warmup >= 0 && Number.isInteger(samples) && samples > 0);
const lane = process.argv.includes('--old-wait') ? 'record' : 'verdict';
const hash = value => createHash('sha256').update(value).digest('hex');
const git = args => execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', ...args],
  { cwd: repo, encoding: 'utf8', timeout: 10000 });
const head = git(['rev-parse', 'HEAD']).trim();
/** Verdict columns; the profiler and commit columns are records. */
const COLUMNS = ['mount-wall', 'mount-active', 'update-wall', 'update-active', 'profiler-mount', 'profiler-update',
  'commits-mount', 'commits-update'];
/** Byte difference between the base bundle and its A/A copy. */
const copyComment = `// ${prefix}-basex: byte-different copy of the base runtime\n`;
const percentile = (values, proportion) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * proportion) - 1];

/**
 * Build base (HEAD), change (working tree) and the trailing-comment copy, and record their provenance.
 * @returns Manifest written to S/bundles/<prefix>-bundles.json
 */
async function prepare() {
  const names = { head: `${prefix}-base`, change: `${prefix}-change` };
  const built = await prepareReactBundles(pkg, bundles, 'both', { head, equivalentHarness: true,
    entry: path.join(directory, 'measure-react-pair-126.entry.tsx'), outputNames: names });
  const baseFile = path.join(bundles, `${names.head}.cjs`), copyFile = path.join(bundles, `${prefix}-basex.cjs`);
  const code = fs.readFileSync(baseFile, 'utf8');
  assert(code.endsWith('\n'));
  fs.writeFileSync(copyFile, code + copyComment);
  assert.notEqual(code, fs.readFileSync(path.join(bundles, `${names.change}.cjs`), 'utf8'), 'change must differ from base');
  const status = git(['status', '--porcelain', '--untracked-files=all', '--', 'packages/canard/schema-form/src']);
  const untracked = status.split('\n').filter(line => line.startsWith('?? ')).map(line => line.slice(3));
  const manifest = { prefix, head, node: process.version, nodeBinary: process.execPath,
    builder: { file: path.join(directory, 'prepare-react-bundles.mjs'), sha256: hash(fs.readFileSync(path.join(directory, 'prepare-react-bundles.mjs'))) },
    workingTree: { status: status.trim().split('\n').filter(Boolean),
      trackedDiffSha256: hash(git(['diff', 'HEAD', '--binary', '--', 'packages/canard/schema-form/src'])),
      untrackedSha256: Object.fromEntries(untracked.map(file => [file, hash(fs.readFileSync(path.join(repo, file)))])) },
    bundles: [...built.map(record => ({ ...record, side: record.variant === 'head' ? 'base' : 'change' })),
      { file: copyFile, side: 'basex', revision: head, derivedFrom: `${names.head}.cjs + one trailing comment line`,
        sha256: hash(fs.readFileSync(copyFile)), bytes: fs.statSync(copyFile).size }],
    preparedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(bundles, `${prefix}-bundles.json`), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

/**
 * Measure one bundle in this process: calibration, warmup and samples of fresh mounts and authored writes.
 * @param side - `base`, `basex` or `change`
 * @param fixtureName - Equivalent fixture name
 * @param slot - Process label used in the output name
 * @param out - Exclusive output path under the scratch root
 * @returns Nothing; the report is written to `out`
 */
async function worker(side, fixtureName, slot, out) {
  assert(['base', 'basex', 'change'].includes(side));
  assert.equal(typeof globalThis.gc, 'function', '--expose-gc is required');
  assert(path.resolve(out).startsWith(scratch + '/'));
  process.env.NODE_ENV = 'production';
  const manifest = JSON.parse(fs.readFileSync(path.join(bundles, `${prefix}-bundles.json`), 'utf8'));
  assert.equal(manifest.head, head, 'Bundles must be prepared at the current HEAD');
  const text = fs.readFileSync(path.join(bundles, `${prefix}-${side}.cjs`), 'utf8');
  assert.equal(hash(text), manifest.bundles.find(record => record.side === side).sha256, `${prefix}-${side} is not the prepared bundle`);
  const pkgRequire = createRequire(path.join(pkg, 'package.json'));
  const bfRequire = createRequire(path.join(repo, 'packages/aileron/benchmark-form/package.json'));
  assert.equal(pkgRequire.resolve('react-dom'), bfRequire.resolve('react-dom'), 'One react-dom instance');
  const module = { exports: {} };
  new Function('require', 'module', 'exports', text)(pkgRequire, module, module.exports);
  const api = module.exports;
  const fixture = api.equivalentFixtures.find(item => item.name === fixtureName);
  assert(fixture, fixtureName);
  const dom = api.setupJsdom();
  const { flushSync } = pkgRequire('react-dom');
  const started = performance.now(), startedAt = new Date().toISOString(), deadline = started + 420_000;
  const settle = lane === 'record' ? () => api.drainTicks(2)
    : async () => { for (let pass = 0; pass < 4; pass++) await new Promise(resolve => setImmediate(resolve)); };
  const drain = async () => { for (let pass = 0; pass < 4; pass++) await new Promise(resolve => setImmediate(resolve)); };
  const canonical = value => JSON.stringify(value, (_key, item) => item && !Array.isArray(item) && typeof item === 'object'
    ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
  const cloneFixture = () => ({ ...fixture, legacy: structuredClone(fixture.legacy), workspace: structuredClone(fixture.workspace) });
  const timing = Object.fromEntries(COLUMNS.map(name => [name, []]));
  const writes = [];
  let observation = null, checkedWrites = 0;

  /** One untimed history; the HEAD-derived runtime commits exactly once per write. */
  const calibrate = async () => {
    globalThis.gc();
    await drain();
    const mounted = await api.mountEquivalentForm(cloneFixture(), 'latest');
    try {
      assert(mounted.commits.length > 0, 'Production profiling must expose mount commits');
      const counts = [];
      for (const [index, interaction] of fixture.interactions.entries()) {
        const before = mounted.commits.length;
        flushSync(() => api.applyInteraction(mounted.handle, interaction));
        await settle();
        counts.push(mounted.commits.length - before);
        assert.equal(counts[index], 1, `${side}/${fixtureName}/calibration/write ${index}`);
      }
      return counts;
    } finally { mounted.teardown(); performance.clearMeasures(); performance.clearMarks(); }
  };
  const calibrated = await calibrate();

  /** One fresh mount and authored write sequence; forced gc and the drain sit outside every clock. */
  const sequence = async index => {
    assert(performance.now() < deadline, 'Worker reached its self-ending seven-minute bound');
    globalThis.gc();
    await drain();
    const mounted = await api.mountEquivalentForm(cloneFixture(), 'latest');
    try {
      assert(mounted.commits.length > 0 && Number.isFinite(mounted.mountActiveMs), 'Profiling build and mount active clock');
      const mountCommits = mounted.commits.length;
      const mountDuration = mounted.commits.reduce((sum, value) => sum + value, 0);
      const paths = () => [...mounted.container.querySelectorAll('[data-path]:not([data-deferred])')]
        .map(element => element.getAttribute('data-path')).sort();
      const mountedValue = canonical(mounted.handle.getValue()), mountedPaths = paths();
      mounted.commits.length = 0;
      let wall = 0, active = 0;
      const sampleWrites = [];
      for (const [write, interaction] of fixture.interactions.entries()) {
        const before = mounted.commits.length;
        const activeStart = performance.eventLoopUtilization(), writeStart = performance.now();
        flushSync(() => api.applyInteraction(mounted.handle, interaction));
        await settle();
        const wallMs = performance.now() - writeStart;
        const activeMs = performance.eventLoopUtilization(activeStart).active;
        const commits = mounted.commits.length - before;
        assert.equal(commits, calibrated[write], `${side}/${fixtureName}/sample ${index}/write ${write}: calibrated commit count`);
        checkedWrites++;
        wall += wallMs; active += activeMs;
        sampleWrites.push([wallMs, activeMs, commits]);
      }
      const updatedPaths = paths();
      assert(mountedPaths.length > 0 && updatedPaths.length > 0);
      const digest = hash(canonical({ mountedValue, updatedValue: canonical(mounted.handle.getValue()), mountedPaths, updatedPaths }));
      if (observation) assert.equal(digest, observation.digest, 'Every sample renders the same values and paths');
      else observation = { digest, mountedPaths: mountedPaths.length, updatedPaths: updatedPaths.length };
      if (index < 0) return;
      const values = { 'mount-wall': mounted.mountMs, 'mount-active': mounted.mountActiveMs, 'update-wall': wall,
        'update-active': active, 'profiler-mount': mountDuration,
        'profiler-update': mounted.commits.reduce((sum, value) => sum + value, 0),
        'commits-mount': mountCommits, 'commits-update': mounted.commits.length };
      for (const [name, value] of Object.entries(values)) { assert(Number.isFinite(value)); timing[name].push(value); }
      writes.push(sampleWrites);
    } finally { mounted.teardown(); performance.clearMeasures(); performance.clearMarks(); }
  };

  try {
    for (let index = -warmup; index < samples; index++) await sequence(index);
    await drain();
  } finally { dom.window.close(); }
  const seconds = (performance.now() - started) / 1000;
  const report = { side, fixture: fixtureName, slot, lane, timing, writes, writeColumns: ['wallMs', 'activeMs', 'commits'],
    observation, calibratedCommitsPerWrite: calibrated, checkedWrites, failedWrites: 0,
    bundle: { file: path.join(bundles, `${prefix}-${side}.cjs`), sha256: hash(text) }, toolSha256: hash(fs.readFileSync(tool)),
    environment: { head, node: process.version, nodeBinary: process.execPath, v8: process.versions.v8,
      react: pkgRequire('react/package.json').version, cpu: os.cpus()[0].model, startedAt, endedAt: new Date().toISOString(),
      seconds, warmup, samples, production: true, profiling: true, validation: 'off', pid: process.pid, bundlesLoaded: 1 },
    wait: lane === 'record' ? 'drainTicks(2), separate record pass' : 'four setImmediate turns',
    method: 'One bundle per process; designated mountEquivalentForm endpoint; ELU active in the same spans; forced gc outside all clocks.' };
  fs.writeFileSync(out, JSON.stringify(report) + '\n', { flag: 'wx' });
}

/**
 * Spawn ABBA single-bundle workers for one stage, fixture and run, then pair them across processes.
 * @param stage - `AA` (base vs basex) or `change` (base vs change)
 * @param fixtureName - Equivalent fixture name
 * @param run - Run number; its parity sets which side opens the first block
 * @returns Pair record with concatenated base/candidate columns in block order and per-order medians
 */
function pair(stage, fixtureName, run) {
  assert(['AA', 'change'].includes(stage) && Number.isInteger(run) && run >= 1);
  const processes = Number(flag('processes', 2));
  assert(Number.isInteger(processes) && processes >= 1);
  const sides = { base: 'base', candidate: stage === 'AA' ? 'basex' : 'change' };
  if (stage === 'AA') {
    const base = fs.readFileSync(path.join(bundles, `${prefix}-base.cjs`), 'utf8');
    const copy = fs.readFileSync(path.join(bundles, `${prefix}-basex.cjs`), 'utf8');
    assert(copy.startsWith(base) && /^\/\/[^\n]*\n$/.test(copy.slice(base.length)), 'A/A copy differs by one trailing comment line');
  }
  const raw = path.join(scratch, 'react-pair-126', flag('tag', 'raw'));
  fs.mkdirSync(raw, { recursive: true });
  const started = performance.now(), blocks = [];
  for (let block = 0; block < processes; block++) {
    const order = (block + run) % 2 === 0 ? ['base', 'candidate'] : ['candidate', 'base'];
    const reports = {};
    for (const [position, role] of order.entries()) {
      const slot = `${stage}-${lane}-${fixtureName}-r${run}-b${block}-${role}`;
      const out = path.join(raw, `${slot}.json`);
      const args = ['--expose-gc', tool, '--worker', sides[role], fixtureName, slot, `--out=${out}`, `--prefix=${prefix}`,
        `--warmup=${warmup}`, `--samples=${samples}`, ...(lane === 'record' ? ['--old-wait'] : [])];
      const childStart = performance.now();
      const result = spawnSync(process.execPath, args, { cwd: repo, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
      const execution = { exitCode: result.status, signal: result.signal, seconds: (performance.now() - childStart) / 1000,
        command: process.execPath, argv: args, position, stderr: result.stderr.slice(-4000) };
      fs.writeFileSync(path.join(raw, `${slot}.execution.json`), JSON.stringify(execution) + '\n');
      assert.equal(result.signal, null, 'Measurement worker must end by itself');
      assert.equal(result.status, 0, `${slot} failed: ${result.stderr.slice(-2000)}`);
      reports[role] = { ...JSON.parse(fs.readFileSync(out, 'utf8')), position, execution };
    }
    blocks.push({ block, order, reports });
  }
  const all = blocks.flatMap(({ reports }) => [reports.base, reports.candidate]);
  for (const report of all) {
    assert.deepEqual(report.observation, all[0].observation, 'Digests must match across every process of both sides');
    assert.deepEqual(report.calibratedCommitsPerWrite, all[0].calibratedCommitsPerWrite, 'Calibrated commit counts must match');
    assert.equal(report.checkedWrites, (warmup + samples) * report.calibratedCommitsPerWrite.length);
  }
  const timing = Object.fromEntries(['base', 'candidate'].map(role => [role, Object.fromEntries(COLUMNS.map(column =>
    [column, blocks.flatMap(({ reports }) => reports[role].timing[column])]))]));
  /** Paired base − candidate medians in µs, split by which side's process ran first in its block. */
  const byOrder = Object.fromEntries(['mount-wall', 'mount-active', 'update-wall', 'update-active'].map(column => {
    const deltas = first => blocks.filter(({ order }) => order[0] === first).flatMap(({ reports }) =>
      reports.base.timing[column].map((value, index) => (value - reports.candidate.timing[column][index]) * 1000));
    const median = values => values.length ? percentile(values, .5) : null;
    return [column, { baseFirst: median(deltas('base')), candidateFirst: median(deltas('candidate')),
      all: median([...deltas('base'), ...deltas('candidate')]),
      perProcessMedians: blocks.map(({ block, order, reports }) => ({ block, first: order[0],
        base: percentile(reports.base.timing[column], .5) * 1000, candidate: percentile(reports.candidate.timing[column], .5) * 1000 })) }];
  }));
  const record = { stage, fixture: fixtureName, run, lane, processesPerSide: processes, sides, head,
    blocks: blocks.map(({ block, order, reports }) => ({ block, order, pids: Object.fromEntries(Object.entries(reports)
      .map(([role, report]) => [role, report.environment.pid])) })),
    timing, observations: { base: all[0].observation, candidate: all[0].observation },
    calibratedCommitsPerWrite: { base: all[0].calibratedCommitsPerWrite, candidate: all[0].calibratedCommitsPerWrite },
    failedWrites: 0, byOrderUs: byOrder, sign: 'base − candidate; negative means the candidate is slower',
    environment: { node: process.version, nodeBinary: process.execPath, warmup, samples, bundlesPerProcess: 1,
      seconds: (performance.now() - started) / 1000 },
    pairing: 'block k pairs its base and candidate processes sample by sample; columns concatenate blocks in order' };
  fs.writeFileSync(path.join(raw, `pair-${stage}-${lane}-${fixtureName}-r${run}.json`), JSON.stringify(record) + '\n');
  assert(record.environment.seconds < 480, 'One pair command must take less than eight minutes');
  return record;
}

if (process.argv[2] === '--prepare') {
  console.log(JSON.stringify(await prepare(), null, 2));
} else if (process.argv[2] === '--worker') {
  const [side, fixtureName, slot] = process.argv.slice(3);
  await worker(side, fixtureName, slot, flag('out'));
} else {
  assert.equal(process.argv[2], '--pair', 'Mode: --prepare, --pair or --worker');
  const [stage, fixtureName, runText] = process.argv.slice(3);
  const record = pair(stage, fixtureName, Number(runText));
  console.log(JSON.stringify({ stage, fixture: fixtureName, run: record.run, lane, byOrderUs: record.byOrderUs,
    seconds: record.environment.seconds }));
}
