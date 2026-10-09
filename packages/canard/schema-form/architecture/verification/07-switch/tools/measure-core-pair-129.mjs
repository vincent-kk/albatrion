/*
 * 사용법(stage-07 루트, /opt/homebrew/bin/node):
 *   node <이 파일> AA if-then off [--blocks=24] [--first-block=0] [--warmup=20] [--samples=41] [--no-gc] [--bundles=<디렉터리>]
 *     [--base-revision=<sha>] [--tag=<이름>]
 *   node <이 파일> head:2 oneOf-10 off --no-gc
 *   node <이 파일> confirm <첫 보고.json> [--setting=<fixture>/<validation>] [--blocks=24] [--tag=confirm] ...
 * 블록 k(전역 번호)는 k가 짝수면 기준→변경, 홀수면 변경→기준 순서로 measure-core-worker-129.mjs 프로세스 둘을 띄웁니다(ABBA).
 * 한 명령이 8분을 넘을 것 같으면 --first-block과 --blocks로 블록을 나누고, report-cluster-129.mjs가 블록 번호로 합칩니다.
 * 프로세스마다 (가)를 판정하고, 실패하면 그 원자료를 <slot>.ga-failed.json으로 남긴 뒤 짝 기록을 저장하지 않고 0이 아닌 코드로 끝납니다.
 * confirm은 첫 보고가 회귀로 표시한 행만 같은 방법으로 다시 잽니다(128C-01 (2)); 이득 행은 확인하지 않습니다.
 * 기록은 S/core-pair-129/<tag>/pair-*.json(cluster-pair-129 형식)입니다.
 */
// CLI: spawns fresh `--expose-gc` measure-core-worker-129 processes one at a time; each loads exactly one bundle.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import { confirmSettings129 } from './confirm-settings-129.mjs';
import { gaValidation129 } from './ga-validation-129.mjs';
import { rowSeed129 } from './row-seed-129.mjs';

const tool = fileURLToPath(import.meta.url);
const directory = path.dirname(tool);
const repo = path.resolve(directory, '../../../../../../..');
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad';
assert.equal(repo, '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(fs.realpathSync(process.execPath), fs.realpathSync('/opt/homebrew/bin/node'), 'Timing runs use /opt/homebrew/bin/node');
const flag = (name, fallback) => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const hash = value => createHash('sha256').update(value).digest('hex');
const worker = path.join(directory, 'measure-core-worker-129.mjs');
const blockCount = Number(flag('blocks', 24)), firstBlock = Number(flag('first-block', 0));
assert(Number.isInteger(blockCount) && blockCount >= 1 && Number.isInteger(firstBlock) && firstBlock >= 0);
const bundles = flag('bundles', path.join(scratch, 'bundles'));
const passthrough = ['warmup', 'samples', 'base-revision'].flatMap(name => flag(name) === undefined ? [] : [`--${name}=${flag(name)}`]);
const noGc = process.argv.includes('--no-gc');
const started = performance.now();

/**
 * Measure one stage/fixture/validation over the requested ABBA blocks and save one cluster-pair-129 record.
 * @param stage - `AA` or `<base>:<candidate>` bundle names
 * @param fixtureName - Fixture name passed to the worker
 * @param validation - `off` or `on`
 * @param raw - Output directory under the scratch root
 * @param confirm - `null`, or the confirmation source and the flagged modes this record confirms
 * @returns The saved record's path; throws (non-zero exit) on a failed worker, a failed (ga) or a digest mismatch
 */
function measureSetting(stage, fixtureName, validation, raw, confirm) {
  if (stage === 'AA') {
    const base = fs.readFileSync(path.join(bundles, 'c-head.cjs'), 'utf8'), copy = fs.readFileSync(path.join(bundles, 'c-headx.cjs'), 'utf8');
    assert(copy.startsWith(base) && /^\/\/[^\n]*\n$/.test(copy.slice(base.length)), 'A/A copy must differ only by one trailing comment line');
  }
  const blocks = [], ga = [];
  for (let block = firstBlock; block < firstBlock + blockCount; block++) {
    assert((performance.now() - started) / 1000 < 450, 'Stop before eight minutes; split the blocks with --first-block');
    const order = block % 2 === 0 ? ['base', 'candidate'] : ['candidate', 'base'];
    const sides = {};
    for (const [position, role] of order.entries()) {
      const slot = `${stage.replace(':', '-')}-${fixtureName}-${validation}-b${block}-${role}`;
      const args = ['--expose-gc', worker, role, stage, fixtureName, validation, `--bundles=${bundles}`, ...passthrough, ...(noGc ? ['--no-gc'] : [])];
      const childStart = performance.now();
      const result = spawnSync(process.execPath, args, { cwd: repo, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
      const execution = { exitCode: result.status, signal: result.signal, seconds: (performance.now() - childStart) / 1000,
        command: process.execPath, argv: args, position, stderr: result.stderr.slice(-4000) };
      fs.writeFileSync(path.join(raw, `${slot}.execution.json`), JSON.stringify(execution) + '\n');
      assert.equal(result.signal, null, 'Measurement worker must end by itself');
      assert.equal(result.status, 0, `${slot} failed: ${result.stderr.slice(-2000)}`);
      const report = JSON.parse(result.stdout);
      assert.equal(report.summary.side, role);
      assert.equal(report.summary.bundlesLoaded, 1);
      const verdict = gaValidation129(report, rowSeed129(`${fixtureName}/${validation}/ga/b${block}/${role}`));
      const failed = Object.entries(verdict).filter(([, item]) => !item.passed).map(([mode, item]) => ({ mode, ...item }));
      if (failed.length) {
        fs.writeFileSync(path.join(raw, `${slot}.ga-failed.json`), JSON.stringify({ failed, worker: report }) + '\n');
        throw new Error(`(ga) failed for ${slot}: ${failed.map(item => item.mode).join(', ')}; the pair record is not saved`);
      }
      fs.writeFileSync(path.join(raw, `${slot}.json`), result.stdout);
      ga.push({ block, role, passed: true, modes: verdict });
      sides[role] = { report, position, seconds: execution.seconds };
    }
    blocks.push({ block, order, sides });
  }
  const record = corePairRecord129({ blocks, stage, fixtureName, validation, confirm, bundles, ga,
    seconds: (performance.now() - started) / 1000 });
  const file = path.join(raw, `pair-${stage.replace(':', '-')}-${fixtureName}-${validation}-b${firstBlock}-${firstBlock + blockCount - 1}.json`);
  fs.writeFileSync(file, JSON.stringify(record) + '\n', { flag: 'wx' });
  return file;
}

/** Build the canonical 129 core pair record; both the legacy CLI and session-131 use this validation/serializer. */
export function corePairRecord129({ blocks, stage, fixtureName, validation, confirm, bundles, ga, seconds }) {
  const reports = blocks.flatMap(({ sides }) => [sides.base.report, sides.candidate.report]);
  const canonicalChecks = checks => JSON.stringify(Object.keys(checks).sort().map(mode =>
    [mode, Object.entries(checks[mode]).sort(([a], [b]) => a.localeCompare(b))]));
  for (const report of reports) {
    assert.equal(canonicalChecks(report.checks), canonicalChecks(reports[0].checks), 'Value digests must match across every process of both sides');
    assert.equal(report.summary.bundle.revision, reports[0].summary.bundle.revision, 'Both bundles must come from one base revision');
  }
  const first = reports[0].summary;
  const columns = [...first.verdictColumns, ...first.recordColumns];
  const side = item => ({ pid: item.report.summary.environment.pid, position: item.position, seconds: item.seconds,
    bundleSha256: item.report.summary.bundle.sha256, emptyEndMs: [...item.report.empty.before, ...item.report.empty.after].map(row => row[1]),
    samples: Object.fromEntries(columns.map(column => [column, item.report.timings[column].map(row => row[1])])) });
  return { format: 'cluster-pair-129', lane: 'core', stage, fixture: fixtureName, validation, confirm,
    baseRevision: first.bundle.revision, bundles, bundleSha256: { base: blocks[0].sides.base.report.summary.bundle.sha256,
      candidate: blocks[0].sides.candidate.report.summary.bundle.sha256 },
    verdictColumns: first.verdictColumns, recordColumns: first.recordColumns, interactionCount: first.interactionCount,
    callCounts: Object.fromEntries(columns.map(column => {
      const mode = column.replace(/-nogc$/, '');
      return [column, mode === 'update' ? first.interactionCount : mode === 'axis-update' ? 2 : 1];
    })),
    blocks: blocks.map(({ block, order, sides }) => ({ block, order, base: side(sides.base), candidate: side(sides.candidate) })),
    ga, gaPassed: true, schedulerImport: first.schedulerImport, valueUnit: 'ms sentinel end-to-end per sample, uncorrected',
    sign: 'base − candidate; negative means the candidate is slower',
    environment: { node: process.version, nodeBinary: process.execPath, warmup: first.warmup, samples: first.sampleCount,
      bundlesPerProcess: 1, seconds,
      workerSha256: hash(fs.readFileSync(worker)), toolSha256: hash(fs.readFileSync(tool)) } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === tool) {
const confirmMode = process.argv[2] === 'confirm';
const raw = path.join(scratch, 'core-pair-129', flag('tag', confirmMode ? 'confirm' : 'raw'));
fs.mkdirSync(raw, { recursive: true });
const saved = [];
if (confirmMode) {
  const plan = confirmSettings129(process.argv[3], 'core');
  const chosen = plan.settings.filter(setting => flag('setting') === undefined || `${setting.fixture}/${setting.validation}` === flag('setting'));
  for (const setting of chosen)
    saved.push(measureSetting(plan.stage, setting.fixture, setting.validation, raw, { source: plan.source, sourceSha256: plan.sha256, modes: setting.modes }));
  console.log(JSON.stringify({ confirm: true, stage: plan.stage, flaggedSettings: plan.settings.length, measured: chosen.length, saved }));
} else {
  const [stage, fixtureName, validation] = process.argv.slice(2);
  saved.push(measureSetting(stage, fixtureName, validation, raw, null));
  console.log(JSON.stringify({ stage, fixture: fixtureName, validation, blocks: [firstBlock, firstBlock + blockCount - 1], gaPassed: true, saved }));
}
assert((performance.now() - started) / 1000 < 480, 'One pair command must take less than eight minutes');
}
