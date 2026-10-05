// Loaded directly by node; each measurement is awaited before starting the next.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const verification = path.resolve(directory, '..');
const pkg = path.resolve(verification, '../../..');
const tool = path.join(directory, 'measure-round-90-baseline.mjs');
const fixtures = ['flat-500', 'nested-d5-f4', 'array-1000', 'computed-visible-derived', 'oneOf-20'];
const lanes = process.argv.slice(2);
assert(lanes.length && lanes.every(lane => ['costs', 'paired', 'phases', 'react', 'react-phases'].includes(lane)));
const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: pkg, encoding: 'utf8' });
assert.equal(head.status, 0);
assert(head.stdout.trim().startsWith('af1904cf9'));

/** Resume only completed files whose method and identity match this fixed pair. */
function completed(lane, fixture, run, side) {
  const stem = lane === 'costs' ? `round-93i-costs-${fixture}-${side}` :
    `round-93i-${lane}-${fixture}-r${run}-${side}`;
  const summaryFile = path.join(verification, `${stem}-summary.json`);
  const timingFile = path.join(verification, `${stem}-timings.json`);
  if (!fs.existsSync(summaryFile)) {
    assert(lane === 'costs' || !fs.existsSync(timingFile), `Incomplete measurement: ${stem}`);
    return false;
  }
  const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
  assert.equal(summary.fixture, fixture);
  assert.equal(summary.variant, side);
  assert.equal(summary.environment.validation, 'off');
  assert.equal(summary.environment.warmup, lane === 'costs' ? 0 : 20);
  assert.equal(summary.environment.samples, lane === 'costs' ? 1 : 101);
  if (lane !== 'costs') {
    assert.equal(summary.run, run);
    const samples = JSON.parse(fs.readFileSync(timingFile, 'utf8'));
    assert.equal(samples.mount.length, 101);
    assert.equal(samples.update.length, 101);
  }
  console.log(`완료 표본 유지: ${stem}`);
  return true;
}

for (const lane of lanes) {
  for (const fixture of lane === 'react-phases' ? ['flat-500', 'computed-visible-derived', 'oneOf-20'] : fixtures) {
    for (let run = 1; run <= (lane === 'costs' ? 1 : 3); run++) {
      for (const side of run === 2 ? ['W', 'H'] : ['H', 'W']) {
        if (completed(lane, fixture, run, side)) continue;
        console.log(`순차 시작: ${lane} ${fixture} r${run} ${side}`);
        const args = ['--expose-gc', tool, fixture, String(run), '--paired', side, '--round93i'];
        if (lane !== 'paired') args.push(`--${lane}`);
        const result = spawnSync(process.execPath, args, { cwd: pkg, stdio: 'inherit' });
        assert.equal(result.status, 0, `${lane} ${fixture} r${run} ${side}`);
      }
    }
  }
}
console.log('요청한 순차 측정 완료');
