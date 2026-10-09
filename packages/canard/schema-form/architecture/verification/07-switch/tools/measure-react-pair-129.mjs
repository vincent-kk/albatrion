/*
 * 사용법(stage-07 루트, /opt/homebrew/bin/node):
 *   node <이 파일> --prepare [--prefix=fap] [--base=<커밋>]
 *   node <이 파일> --pair AA array-100 [--blocks=24] [--first-block=0] [--warmup=20] [--samples=41] [--no-gc] [--prefix=fap]
 *     [--base-revision=<sha>] [--tag=<이름>]
 *   node <이 파일> --pair change array-100 --no-gc
 *   node <이 파일> --confirm <첫 보고.json> [--setting=<fixture>/off] [--blocks=24] [--tag=confirm] ...
 * --prepare는 measure-react-pair-126과 같은 진입점으로 S/bundles/<prefix>-base.cjs(--base 커밋 고정, 기본 HEAD),
 * <prefix>-change.cjs(작업 트리), <prefix>-basex.cjs(base + 끝 주석 한 줄)와 <prefix>-bundles.json을 만듭니다.
 * --pair는 측정 프로세스마다 번들 하나만 올리고, 번들을 매니페스트의 SHA-256과 대조합니다(현재 HEAD와는 비교하지 않음).
 * 블록 k(전역 번호)는 k가 짝수면 기준→변경, 홀수면 변경→기준 순서입니다(ABBA). 쓰기당 커밋 수는 그 프로세스의 보정 회차에서
 * 관측한 값과 같아야 하며, 모든 프로세스의 보정값도 같아야 합니다. --no-gc는 강제 gc 없는 두 번째 전체 순서를 <열>-nogc 기록 열로
 * 더합니다. --confirm은 첫 보고가 회귀로 표시한 React 행만 다시 잽니다(128C-01 (2)). 기록은 S/react-pair-129/<tag>/pair-*.json입니다.
 */
// CLI: --pair and --confirm spawn fresh `--expose-gc` workers sequentially; each worker loads exactly one bundle.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import { confirmSettings129 } from './confirm-settings-129.mjs';
import { prepareReactBundles } from './prepare-react-bundles.mjs';
import { loadBundle131 } from './load-bundle-131.mjs';
import { telemetry131 } from './telemetry-131.mjs';

const tool = fileURLToPath(import.meta.url);
const directory = path.dirname(tool);
const repo = path.resolve(directory, '../../../../../../..');
const pkg = path.join(repo, 'packages/canard/schema-form');
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad';
const bundles = path.join(scratch, 'bundles');
assert.equal(repo, '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(fs.realpathSync(process.execPath), fs.realpathSync('/opt/homebrew/bin/node'), 'Timing runs use /opt/homebrew/bin/node');
const flag = (name, fallback) => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const sessionJob = flag('session-job') ? JSON.parse(fs.readFileSync(flag('session-job'), 'utf8')) : null;
let formIndex = 0;
const prefix = flag('prefix', 'fap');
assert.match(prefix, /^[a-z0-9]+$/);
const warmup = Number(flag('warmup', 20)), samples = Number(flag('samples', 41));
assert(Number.isInteger(warmup) && warmup >= 0 && Number.isInteger(samples) && samples > 0);
const noGc = process.argv.includes('--no-gc');
const hash = value => createHash('sha256').update(value).digest('hex');
const git = args => execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', ...args],
  { cwd: repo, encoding: 'utf8', timeout: 10000 });
/** Verdict columns; the profiler and commit columns are records. */
const VERDICT_COLUMNS = ['mount-wall', 'mount-active', 'update-wall', 'update-active'];
const RECORD_COLUMNS = ['profiler-mount', 'profiler-update', 'commits-mount', 'commits-update'];
const COLUMNS = [...VERDICT_COLUMNS, ...RECORD_COLUMNS];
/** Byte difference between the base bundle and its A/A copy (measure-react-pair-126's comment, so its bundles stay valid). */
const copyComment = `// ${prefix}-basex: byte-different copy of the base runtime\n`;

/**
 * Build base (the given commit), change (working tree) and the trailing-comment copy, and record their provenance.
 * @returns Manifest written to S/bundles/<prefix>-bundles.json; `head` is the base revision the base bundle was built from
 */
async function prepare() {
  const base = git(['rev-parse', `${flag('base', 'HEAD')}^{commit}`]).trim();
  const names = { head: `${prefix}-base`, change: `${prefix}-change` };
  const built = await prepareReactBundles(pkg, bundles, 'both', { head: base, equivalentHarness: true,
    entry: path.join(directory, 'measure-react-pair-126.entry.tsx'), outputNames: names });
  const baseFile = path.join(bundles, `${names.head}.cjs`), copyFile = path.join(bundles, `${prefix}-basex.cjs`);
  const code = fs.readFileSync(baseFile, 'utf8');
  assert(code.endsWith('\n'));
  fs.writeFileSync(copyFile, code + copyComment);
  assert.notEqual(code, fs.readFileSync(path.join(bundles, `${names.change}.cjs`), 'utf8'), 'change must differ from base');
  const status = git(['status', '--porcelain', '--untracked-files=all', '--', 'packages/canard/schema-form/src']);
  const untracked = status.split('\n').filter(line => line.startsWith('?? ')).map(line => line.slice(3));
  const manifest = { prefix, head: base, node: process.version, nodeBinary: process.execPath,
    builder: { file: path.join(directory, 'prepare-react-bundles.mjs'), sha256: hash(fs.readFileSync(path.join(directory, 'prepare-react-bundles.mjs'))) },
    workingTree: { status: status.trim().split('\n').filter(Boolean),
      trackedDiffSha256: hash(git(['diff', base, '--binary', '--', 'packages/canard/schema-form/src'])),
      untrackedSha256: Object.fromEntries(untracked.map(file => [file, hash(fs.readFileSync(path.join(repo, file)))])) },
    bundles: [...built.map(record => ({ ...record, side: record.variant === 'head' ? 'base' : 'change' })),
      { file: copyFile, side: 'basex', revision: base, derivedFrom: `${names.head}.cjs + one trailing comment line`,
        sha256: hash(fs.readFileSync(copyFile)), bytes: fs.statSync(copyFile).size }],
    preparedAt: new Date().toISOString(), preparedBy: tool };
  fs.writeFileSync(path.join(bundles, `${prefix}-bundles.json`), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

/**
 * Measure one bundle in this process: calibration, then warmup and samples of fresh mounts and authored writes with
 * forced gc outside every clock, then the optional no-GC pass.
 * @param side - `base`, `basex` or `change`
 * @param fixtureName - Equivalent fixture name
 * @param out - Exclusive output path under the scratch root
 * @returns Nothing; the report is written to `out`
 */
async function worker(side, fixtureName, out) {
  const telemetry = sessionJob ? telemetry131(formIndex++ === 0) : null;
  assert(['base', 'basex', 'change'].includes(side));
  assert.equal(typeof globalThis.gc, 'function', '--expose-gc is required');
  assert(sessionJob || path.resolve(out).startsWith(scratch + '/'));
  process.env.NODE_ENV = 'production';
  const pkgRequire = createRequire(path.join(pkg, 'package.json'));
  const loaded = sessionJob ? loadBundle131(sessionJob.bundle, pkgRequire) : null;
  const manifestText = loaded?.manifestText ?? fs.readFileSync(path.join(bundles, `${prefix}-bundles.json`), 'utf8'), manifest = JSON.parse(manifestText);
  if (flag('base-revision')) assert.equal(manifest.head, flag('base-revision'), 'Bundles were built from another base revision');
  const file = sessionJob?.bundle.file ?? path.join(bundles, `${prefix}-${side}.cjs`), text = loaded?.text ?? fs.readFileSync(file, 'utf8');
  assert.equal(hash(text), loaded?.entry.sha256 ?? manifest.bundles.find(record => record.side === side).sha256, `${prefix}-${side} does not match the SHA-256 in its manifest`);
  const bfRequire = createRequire(path.join(repo, 'packages/aileron/benchmark-form/package.json'));
  assert.equal(pkgRequire.resolve('react-dom'), bfRequire.resolve('react-dom'), 'One react-dom instance');
  const module = { exports: {} };
  let bundlesLoaded = loaded?.bundlesLoaded ?? 0;
  if (!loaded) {
    new Function('require', 'module', 'exports', text)(pkgRequire, module, module.exports);
    bundlesLoaded++;
  }
  const api = loaded?.api ?? module.exports;
  const fixture = api.equivalentFixtures.find(item => item.name === fixtureName);
  assert(fixture, fixtureName);
  const dom = api.setupJsdom();
  const { flushSync } = pkgRequire('react-dom');
  const started = performance.now(), startedAt = new Date().toISOString(), deadline = sessionJob
    ? Math.min(started + 420_000, sessionJob.deadlineEpochMs - Date.now() + started) : started + 420_000;
  const drain = async () => { for (let pass = 0; pass < 4; pass++) await new Promise(resolve => setImmediate(resolve)); };
  const canonical = value => JSON.stringify(value, (_key, item) => item && !Array.isArray(item) && typeof item === 'object'
    ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
  const cloneFixture = () => ({ ...fixture, legacy: structuredClone(fixture.legacy), workspace: structuredClone(fixture.workspace) });
  const recordColumns = noGc ? COLUMNS.map(column => `${column}-nogc`) : [];
  const timing = Object.fromEntries([...COLUMNS, ...recordColumns].map(name => [name, []]));
  let observation = null, checkedWrites = 0;

  /** One untimed history; records the commits per write that every later sample of this process must repeat. */
  const calibrate = async () => {
    telemetry ? telemetry.gc() : globalThis.gc();
    await drain();
    const mounted = await api.mountEquivalentForm(cloneFixture(), 'latest');
    try {
      assert(mounted.commits.length > 0, 'Production profiling must expose mount commits');
      const counts = [];
      for (const interaction of fixture.interactions) {
        const before = mounted.commits.length;
        flushSync(() => api.applyInteraction(mounted.handle, interaction));
        await drain();
        counts.push(mounted.commits.length - before);
      }
      assert(counts.every(count => Number.isInteger(count) && count >= 0));
      return counts;
    } finally { mounted.teardown(); performance.clearMeasures(); performance.clearMarks(); }
  };
  telemetry?.ready();
  const calibrated = telemetry ? await telemetry.run('calibrationMs', calibrate) : await calibrate();

  /** One fresh mount and authored write sequence; with `gc`, forced gc sits outside every clock, otherwise columns get `-nogc`. */
  const sequence = async (index, gc) => {
    assert(performance.now() < deadline, 'Worker reached its self-ending seven-minute bound');
    if (gc) telemetry ? telemetry.gc() : globalThis.gc();
    await drain();
    const mounted = await api.mountEquivalentForm(cloneFixture(), 'latest');
    const mountEnd = sessionJob ? performance.now() : null;
    const mountStart = sessionJob ? mountEnd - mounted.mountMs : null;
    try {
      assert(mounted.commits.length > 0 && Number.isFinite(mounted.mountActiveMs), 'Profiling build and mount active clock');
      const mountCommits = mounted.commits.length;
      const mountDuration = mounted.commits.reduce((sum, value) => sum + value, 0);
      const paths = () => [...mounted.container.querySelectorAll('[data-path]:not([data-deferred])')]
        .map(element => element.getAttribute('data-path')).sort();
      let mountedValue, mountedPaths;
      if (telemetry) telemetry.digest(() => { mountedValue = canonical(mounted.handle.getValue()); mountedPaths = paths(); });
      else { mountedValue = canonical(mounted.handle.getValue()); mountedPaths = paths(); }
      if (telemetry && !gc) { telemetry.gc(true); await drain(); }
      mounted.commits.length = 0;
      let wall = 0, active = 0;
      const writeWindows = telemetry ? [] : null;
      for (const [write, interaction] of fixture.interactions.entries()) {
        const before = mounted.commits.length;
        const activeStart = performance.eventLoopUtilization(), writeStart = performance.now();
        flushSync(() => api.applyInteraction(mounted.handle, interaction));
        await drain();
        const wallMs = performance.now() - writeStart;
        const activeMs = performance.eventLoopUtilization(activeStart).active;
        if (telemetry) writeWindows.push([writeStart, writeStart + wallMs]);
        assert.equal(mounted.commits.length - before, calibrated[write], `${side}/${fixtureName}/sample ${index}/write ${write}: calibrated commit count`);
        checkedWrites++;
        wall += wallMs; active += activeMs;
      }
      let updatedPaths, digest;
      if (telemetry) telemetry.digest(() => { updatedPaths = paths();
        assert(mountedPaths.length > 0 && updatedPaths.length > 0);
        digest = hash(canonical({ mountedValue, updatedValue: canonical(mounted.handle.getValue()), mountedPaths, updatedPaths })); });
      else {
        updatedPaths = paths();
        assert(mountedPaths.length > 0 && updatedPaths.length > 0);
        digest = hash(canonical({ mountedValue, updatedValue: canonical(mounted.handle.getValue()), mountedPaths, updatedPaths }));
      }
      if (observation) assert.equal(digest, observation.digest, 'Every sample renders the same values and paths');
      else observation = { digest, mountedPaths: mountedPaths.length, updatedPaths: updatedPaths.length };
      if (index < 0) return;
      const values = { 'mount-wall': mounted.mountMs, 'mount-active': mounted.mountActiveMs, 'update-wall': wall,
        'update-active': active, 'profiler-mount': mountDuration,
        'profiler-update': mounted.commits.reduce((sum, value) => sum + value, 0),
        'commits-mount': mountCommits, 'commits-update': mounted.commits.length };
      for (const [name, value] of Object.entries(values)) {
        assert(Number.isFinite(value));
        const column = gc ? name : `${name}-nogc`;
        timing[column].push(value);
        telemetry?.window(column, name.includes('mount') ? [[mountStart, mountEnd]] : writeWindows, index, name.includes('mount') ? [] : writeWindows);
      }
    } finally { mounted.teardown(); performance.clearMeasures(); performance.clearMarks(); }
  };

  try {
    for (const gc of noGc ? [true, false] : [true]) {
      if (telemetry && gc === false) telemetry.start();
      for (let index = -warmup; index < samples; index++) {
        if (telemetry) await telemetry.run(index < 0 ? 'warmupMs' : 'sampleMs', () => sequence(index, gc));
        else await sequence(index, gc);
      }
      if (telemetry && gc === false) await telemetry.stop();
    }
    await drain();
  } finally { dom.window.close(); }
  const report = { format: 'react-worker-129', side, fixture: fixtureName, timing, verdictColumns: VERDICT_COLUMNS,
    recordColumns: [...RECORD_COLUMNS, ...recordColumns], observation, calibratedCommitsPerWrite: calibrated, checkedWrites,
    bundle: { file, sha256: hash(text), revision: sessionJob?.bundle.revision ?? manifest.head, manifestSha256: hash(manifestText) }, toolSha256: hash(fs.readFileSync(tool)),
    environment: { head: git(['rev-parse', 'HEAD']).trim(), node: process.version, nodeBinary: process.execPath, v8: process.versions.v8,
      react: pkgRequire('react/package.json').version, cpu: os.cpus()[0].model, startedAt, endedAt: new Date().toISOString(),
      seconds: (performance.now() - started) / 1000, warmup, samples, production: true, profiling: true, validation: 'off',
      pid: process.pid, bundlesLoaded, noGcPass: noGc },
    wait: 'four setImmediate turns',
    method: 'One bundle per process; designated mountEquivalentForm endpoint; ELU active in the same spans; forced gc outside all clocks.' };
  if (telemetry) { report.telemetry = await telemetry.finish(); return report; }
  fs.writeFileSync(out, JSON.stringify(report) + '\n', { flag: 'wx' });
}

/**
 * Spawn ABBA single-bundle workers for one stage and fixture over the requested blocks and save a cluster-pair-129 record.
 * @param stage - `AA` (base vs basex) or `change` (base vs change)
 * @param fixtureName - Equivalent fixture name
 * @param raw - Output directory under the scratch root
 * @param confirm - `null`, or the confirmation source and the flagged columns this record confirms
 * @param started - performance.now() at command start, for the eight-minute guard
 * @returns The saved record's path
 */
function pair(stage, fixtureName, raw, confirm, started) {
  assert(['AA', 'change'].includes(stage));
  const blockCount = Number(flag('blocks', 24)), firstBlock = Number(flag('first-block', 0));
  assert(Number.isInteger(blockCount) && blockCount >= 1 && Number.isInteger(firstBlock) && firstBlock >= 0);
  const sides = { base: 'base', candidate: stage === 'AA' ? 'basex' : 'change' };
  if (stage === 'AA') {
    const base = fs.readFileSync(path.join(bundles, `${prefix}-base.cjs`), 'utf8');
    const copy = fs.readFileSync(path.join(bundles, `${prefix}-basex.cjs`), 'utf8');
    assert(copy.startsWith(base) && /^\/\/[^\n]*\n$/.test(copy.slice(base.length)), 'A/A copy differs by one trailing comment line');
  }
  const passthrough = [`--prefix=${prefix}`, `--warmup=${warmup}`, `--samples=${samples}`, ...(noGc ? ['--no-gc'] : []),
    ...(flag('base-revision') ? [`--base-revision=${flag('base-revision')}`] : [])];
  const blocks = [];
  for (let block = firstBlock; block < firstBlock + blockCount; block++) {
    assert((performance.now() - started) / 1000 < 450, 'Stop before eight minutes; split the blocks with --first-block');
    const order = block % 2 === 0 ? ['base', 'candidate'] : ['candidate', 'base'];
    const reports = {};
    for (const [position, role] of order.entries()) {
      const slot = `${stage}-${fixtureName}-b${block}-${role}`;
      const out = path.join(raw, `${slot}.json`);
      const args = ['--expose-gc', tool, '--worker', sides[role], fixtureName, `--out=${out}`, ...passthrough];
      const childStart = performance.now();
      const result = spawnSync(process.execPath, args, { cwd: repo, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
      const execution = { exitCode: result.status, signal: result.signal, seconds: (performance.now() - childStart) / 1000,
        command: process.execPath, argv: args, position, stderr: result.stderr.slice(-4000) };
      fs.writeFileSync(path.join(raw, `${slot}.execution.json`), JSON.stringify(execution) + '\n');
      assert.equal(result.signal, null, 'Measurement worker must end by itself');
      assert.equal(result.status, 0, `${slot} failed: ${result.stderr.slice(-2000)}`);
      reports[role] = { ...JSON.parse(fs.readFileSync(out, 'utf8')), position, seconds: execution.seconds };
    }
    blocks.push({ block, order, reports });
  }
  const record = reactPairRecord129({ blocks, stage, fixtureName, confirm, prefix, sides, warmup, samples, noGc,
    seconds: (performance.now() - started) / 1000 });
  const file = path.join(raw, `pair-${stage}-${fixtureName}-b${firstBlock}-${firstBlock + blockCount - 1}.json`);
  fs.writeFileSync(file, JSON.stringify(record) + '\n', { flag: 'wx' });
  return file;
}

/** Build the canonical 129 React pair record; the legacy CLI and session-131 share digest/commit validation. */
export function reactPairRecord129({ blocks, stage, fixtureName, confirm, prefix, sides, warmup, samples, noGc, seconds }) {
  const all = blocks.flatMap(({ reports }) => [reports.base, reports.candidate]);
  for (const report of all) {
    assert.deepEqual(report.observation, all[0].observation, 'Digests must match across every process of both sides');
    assert.deepEqual(report.calibratedCommitsPerWrite, all[0].calibratedCommitsPerWrite, 'Calibrated commit counts must match across processes');
    assert.equal(report.checkedWrites, (warmup + samples) * (noGc ? 2 : 1) * report.calibratedCommitsPerWrite.length);
    assert.equal(report.bundle.revision, all[0].bundle.revision, 'Both bundles must come from one base revision');
  }
  const first = all[0];
  const side = report => ({ pid: report.environment.pid, position: report.position, seconds: report.seconds, bundleSha256: report.bundle.sha256,
    samples: Object.fromEntries([...first.verdictColumns, ...first.recordColumns].map(column => [column, report.timing[column]])) });
  return { format: 'cluster-pair-129', lane: 'react', stage, prefix, fixture: fixtureName, validation: 'off', confirm,
    baseRevision: first.bundle.revision, sides, bundleSha256: { base: blocks[0].reports.base.bundle.sha256, candidate: blocks[0].reports.candidate.bundle.sha256 },
    verdictColumns: first.verdictColumns, recordColumns: first.recordColumns,
    blocks: blocks.map(({ block, order, reports }) => ({ block, order, base: side(reports.base), candidate: side(reports.candidate) })),
    observation: first.observation, calibratedCommitsPerWrite: first.calibratedCommitsPerWrite, failedWrites: 0,
    valueUnit: 'ms per sample', sign: 'base − candidate; negative means the candidate is slower',
    environment: { node: process.version, nodeBinary: process.execPath, warmup, samples, bundlesPerProcess: 1,
      seconds, toolSha256: hash(fs.readFileSync(tool)) } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === tool) {
if (sessionJob) {
  const reports = [];
  for (const setting of sessionJob.settings) reports.push(await worker(sessionJob.role === 'base' ? 'base' : 'change', setting.fixture));
  fs.writeFileSync(sessionJob.out, JSON.stringify({ reports, bundlesLoaded: reports.at(-1)?.environment.bundlesLoaded ?? 0, pid: process.pid }) + '\n', { flag: 'wx' });
} else if (process.argv[2] === '--prepare') {
  console.log(JSON.stringify(await prepare(), null, 2));
} else if (process.argv[2] === '--worker') {
  const [side, fixtureName] = process.argv.slice(3);
  await worker(side, fixtureName, flag('out'));
} else {
  assert(['--pair', '--confirm'].includes(process.argv[2]), 'Mode: --prepare, --pair, --confirm or --worker');
  const started = performance.now(), confirmMode = process.argv[2] === '--confirm';
  const raw = path.join(scratch, 'react-pair-129', flag('tag', confirmMode ? 'confirm' : 'raw'));
  fs.mkdirSync(raw, { recursive: true });
  const saved = [];
  if (confirmMode) {
    const plan = confirmSettings129(process.argv[3], 'react');
    assert.equal(plan.stage, 'change', 'Only a change report is confirmed');
    const chosen = plan.settings.filter(setting => flag('setting') === undefined || `${setting.fixture}/${setting.validation}` === flag('setting'));
    for (const setting of chosen)
      saved.push(pair(plan.stage, setting.fixture, raw, { source: plan.source, sourceSha256: plan.sha256, modes: setting.modes }, started));
    console.log(JSON.stringify({ confirm: true, flaggedSettings: plan.settings.length, measured: chosen.length, saved }));
  } else {
    const [stage, fixtureName] = process.argv.slice(3);
    saved.push(pair(stage, fixtureName, raw, null, started));
    console.log(JSON.stringify({ stage, fixture: fixtureName, saved }));
  }
  assert((performance.now() - started) / 1000 < 480, 'One pair command must take less than eight minutes');
}
}
