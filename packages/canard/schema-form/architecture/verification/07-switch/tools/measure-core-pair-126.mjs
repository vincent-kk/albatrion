/*
 * 사용법(stage-07 루트, /opt/homebrew/bin/node):
 *   node <이 파일> AA if-then off 1 [--processes=2] [--warmup=20] [--samples=101] [--no-gc-first] [--bundles=<디렉터리>] [--tag=<이름>]
 *   node <이 파일> head:1c oneOf-10 off 1
 * 측정 프로세스마다 c-<이름>.cjs 하나만 올립니다(measure-verdict-121.mjs --pair --single). 회차 r의 k번째 블록은
 * (k + r)이 짝수면 기준→변경, 홀수면 변경→기준 순서로 새 프로세스를 띄우므로(ABBA) 두 쪽의 프로세스 수와
 * 앞선 횟수가 같습니다. 각 프로세스는 95C-01 절차(예열 20, 표본 101, 시계 밖 강제 gc, gc 뒤 첫 빈 호출 쌍 버림,
 * 짝 빈 호출 꼬리)를 그대로 따르고, 공식 표본 뒤 경계 회차로 (ga)를 프로세스마다 검사합니다.
 * 블록 k의 기준·변경 프로세스를 표본 순번으로 짝지어 report-verdict-121.mjs의 pairRows121 입력 모양으로 저장합니다.
 */
// CLI: spawns fresh `--expose-gc` measure-verdict-121 workers one at a time; each loads exactly one bundle.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import { bootstrap, validationA121 } from './report-verdict-121.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(directory, '../../../../../../..');
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad';
assert.equal(repo, '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(fs.realpathSync(process.execPath), fs.realpathSync('/opt/homebrew/bin/node'), 'Timing runs use /opt/homebrew/bin/node');
const flag = (name, fallback) => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const hash = value => createHash('sha256').update(value).digest('hex');
const percentile = (values, proportion) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * proportion) - 1];

/**
 * Evaluate (ga) for one single-bundle worker from its own empty controls, samples and boundary ordering.
 * The noise width is report-verdict-121's: empty-wait p95 absolute deviation per call, both median bootstrap
 * half-widths and the calibration median uncertainty, with a 1 µs floor.
 * @param worker - measure-verdict-121 --pair --single output
 * @param seed - Bootstrap seed base for this process
 * @returns Per verdict mode `{ differenceMs, noiseMs, withinNoise, zeroEngineMacrotasks, passed }`
 */
function processValidation(worker, seed) {
  const { summary, empty, ordering } = worker;
  const side = summary.single;
  const controls = [...empty.before, ...empty.after];
  const emptyEnd = percentile(controls.map(row => row[1]), .5), emptyMicro = percentile(controls.map(row => row[0]), .5);
  const waiting = controls.map(row => row[1] - row[0]), waitMedian = percentile(waiting, .5);
  const emptyNoise = percentile(waiting.map(value => Math.abs(value - waitMedian)), .95);
  const endCi = bootstrap(controls.map(row => row[1]), seed + 1), microCi = bootstrap(controls.map(row => row[0]), seed + 2);
  return Object.fromEntries(summary.verdictColumns.map(mode => {
    const callCount = mode === 'update' ? summary.interactionCount : mode === 'axis-update' ? 2 : 1;
    const rows = worker.timings[side][mode];
    const microtask = rows.map(row => row[0] - emptyMicro * callCount);
    const sentinel = rows.map(row => row[1] - emptyEnd * callCount);
    const pairedSentinel = sentinel.map((value, index) => value - (rows[index][2] - callCount * (emptyEnd - emptyMicro)));
    const sentinelCi = bootstrap(sentinel, seed + 95), expectedCi = bootstrap(microtask, seed + 96);
    const noise = Math.max(.001, callCount * emptyNoise + sentinelCi.halfWidth + expectedCi.halfWidth +
      callCount * (endCi.halfWidth + microCi.halfWidth));
    return [mode, validationA121(pairedSentinel, microtask, noise, [ordering[mode]])];
  }));
}

const [stage, fixtureName, validation, runText] = process.argv.slice(2);
const run = Number(runText);
assert(Number.isInteger(run) && run >= 1 && run <= 9, 'Run 1-9');
const processes = Number(flag('processes', 2));
assert(Number.isInteger(processes) && processes >= 1);
const bundles = flag('bundles', path.join(scratch, 'bundles'));
const names = stage === 'AA' ? ['head', 'headx'] : stage.split(':');
if (stage === 'AA') {
  const base = fs.readFileSync(path.join(bundles, 'c-head.cjs'), 'utf8'), copy = fs.readFileSync(path.join(bundles, 'c-headx.cjs'), 'utf8');
  assert(copy.startsWith(base) && /^\/\/[^\n]*\n$/.test(copy.slice(base.length)), 'A/A copy must differ only by one trailing comment line');
}
const raw = path.join(scratch, 'core-pair-126', flag('tag', 'raw'));
fs.mkdirSync(raw, { recursive: true });
const worker = path.join(directory, 'measure-verdict-121.mjs');
const passthrough = ['warmup', 'samples'].flatMap(name => flag(name) === undefined ? [] : [`--${name}=${flag(name)}`]);
const started = performance.now(), blocks = [];
for (let block = 0; block < processes; block++) {
  const order = (block + run) % 2 === 0 ? ['base', 'candidate'] : ['candidate', 'base'];
  const reports = {};
  for (const [position, role] of order.entries()) {
    const slot = `${stage.replace(':', '-')}-${fixtureName}-${validation}-r${run}-b${block}-${role}`;
    // Sample-order parity inside a single-bundle process has no partner; run 1 keeps the worker's own convention.
    const args = ['--expose-gc', worker, '--pair', stage, fixtureName, validation, '1', `--single=${role}`, `--bundles=${bundles}`,
      ...passthrough, ...(process.argv.includes('--no-gc-first') ? ['--no-gc-first'] : [])];
    const childStart = performance.now();
    const result = spawnSync(process.execPath, args, { cwd: repo, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    const execution = { exitCode: result.status, signal: result.signal, seconds: (performance.now() - childStart) / 1000,
      command: process.execPath, argv: args, position, stderr: result.stderr.slice(-4000) };
    assert.equal(result.signal, null, 'Measurement worker must end by itself');
    assert.equal(result.status, 0, `${slot} failed: ${result.stderr.slice(-2000)}`);
    fs.writeFileSync(path.join(raw, `${slot}.json`), result.stdout);
    fs.writeFileSync(path.join(raw, `${slot}.execution.json`), JSON.stringify(execution) + '\n');
    const report = JSON.parse(result.stdout);
    assert.equal(report.summary.single, role);
    assert.equal(report.summary.bundlesLoaded, 1);
    reports[role] = { ...report, position, execution, ga: processValidation(report, (block * 2 + position + 1) * 1000 + run) };
  }
  blocks.push({ block, order, reports });
}
const all = blocks.flatMap(({ reports }) => [reports.base, reports.candidate]);
const canonicalChecks = checks => JSON.stringify(Object.keys(checks).sort().map(mode =>
  [mode, Object.entries(checks[mode]).sort(([a], [b]) => a.localeCompare(b))]));
for (const report of all)
  assert.equal(canonicalChecks(report.checks), canonicalChecks(all[0].checks), 'Value digests must match across every process of both sides');
const modes = all[0].summary.verdictColumns, recordModes = all[0].summary.recordColumns;
const pairWorkers = blocks.map(({ block, order, reports }) => ({
  summary: { ...reports.base.summary, stage, run, block, order, single: null, sameCompiledSource: false,
    bundleSha256: { base: reports.base.summary.bundleSha256.base, candidate: reports.candidate.summary.bundleSha256.candidate },
    sampleOrder: 'one bundle per process; ABBA blocks; block k pairs its base and candidate processes sample by sample' },
  timings: { base: reports.base.timings.base, candidate: reports.candidate.timings.candidate } }));
const byOrderUs = Object.fromEntries([...modes, ...recordModes].map(mode => {
  const deltas = first => blocks.filter(({ order }) => order[0] === first).flatMap(({ reports }) =>
    reports.base.timings.base[mode].map((row, index) => (row[1] - reports.candidate.timings.candidate[mode][index][1]) * 1000));
  const median = values => values.length ? percentile(values, .5) : null;
  return [mode, { baseFirst: median(deltas('base')), candidateFirst: median(deltas('candidate')),
    all: median([...deltas('base'), ...deltas('candidate')]) }];
}));
const ga = blocks.flatMap(({ block, reports }) => ['base', 'candidate'].map(role => ({ block, role,
  passed: Object.values(reports[role].ga).every(result => result.passed),
  failed: Object.entries(reports[role].ga).filter(([, result]) => !result.passed).map(([mode, result]) => ({ mode, ...result })) })));
// The boundary half of (ga) can only see engine work that goes through the shared scheduler module.
const schedulerImport = Object.fromEntries(names.map(name =>
  [name, fs.readFileSync(path.join(bundles, `c-${name}.cjs`), 'utf8').includes('@winglet/common-utils/scheduler')]));
const record = { stage, names, fixture: fixtureName, validation, run, processesPerSide: processes, bundles, schedulerImport,
  blocks: blocks.map(({ block, order, reports }) => ({ block, order,
    pids: { base: reports.base.summary.environment.pid, candidate: reports.candidate.summary.environment.pid },
    seconds: { base: reports.base.execution.seconds, candidate: reports.candidate.execution.seconds } })),
  workers: pairWorkers, ga, gaPassed: ga.every(item => item.passed), byOrderUs,
  sign: 'base − candidate sentinel end-to-end; negative means the candidate is slower',
  environment: { node: process.version, nodeBinary: process.execPath, seconds: (performance.now() - started) / 1000,
    workerSha256: hash(fs.readFileSync(worker)), toolSha256: hash(fs.readFileSync(fileURLToPath(import.meta.url))), bundlesPerProcess: 1 } };
fs.writeFileSync(path.join(raw, `pair-${stage.replace(':', '-')}-${fixtureName}-${validation}-r${run}.json`), JSON.stringify(record) + '\n');
assert(record.environment.seconds < 480, 'One pair command must take less than eight minutes');
console.log(JSON.stringify({ stage, fixture: fixtureName, validation, run, gaPassed: record.gaPassed,
  gaFailures: ga.flatMap(item => item.failed.map(failure => `${item.block}/${item.role}/${failure.mode}`)),
  byOrderUs: Object.fromEntries(Object.entries(byOrderUs).map(([mode, value]) => [mode,
    Object.fromEntries(Object.entries(value).map(([key, number]) => [key, number === null ? null : Number(number.toFixed(3))]))])),
  seconds: Number(record.environment.seconds.toFixed(1)) }));
