// Loaded directly by node; each awaited child serializes fixture/version/run and exits naturally.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(directory, '..');
const pkg = path.resolve(output, '../../..');
const repo = path.resolve(pkg, '../../..');
const worker = path.join(directory, 'measure-verdict-93c01.mjs');
const fixtures = ['sample-0', 'sample-1', 'sample-2', 'sample-3',
  'flat-50', 'flat-100', 'flat-500', 'nested-d3-f4', 'nested-d5-f4',
  'array-100', 'array-500', 'array-1000', 'computed-visible-derived',
  'oneOf-5', 'oneOf-10', 'oneOf-20', 'oneOf-40', 'if-then'];
const requested = process.argv.slice(2);
const lanes = requested.filter(value => !value.startsWith('--'));
assert(lanes.length && lanes.every(lane => ['core', 'react', 'react-phases', 'core-axis'].includes(lane)));
const selected = requested.find(value => value.startsWith('--fixture='))?.slice(10);
const firstRunOnly = requested.includes('--first-run-only');
let completed = 0;

/** Reuse only complete files from this exact fixed method, runtime and source revision. */
function loadCompleted(stem, identity) {
  const summaryPath = path.join(output, `${stem}-summary.json`);
  const timingPath = path.join(output, `${stem}-timings.json`);
  if (!fs.existsSync(summaryPath)) { assert(!fs.existsSync(timingPath)); return null; }
  assert(fs.existsSync(timingPath));
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  for (const [key, value] of Object.entries(identity)) assert.equal(summary.environment[key], value, `${stem}/${key}`);
  assert.equal(summary.environment.node, process.version);
  assert.equal(summary.environment.v8, process.versions.v8);
  assert.equal(summary.environment.head, 'ccfecf1b43ce1c648246722e2174db81ec17487f');
  assert.equal(summary.environment.warmup, 12);
  assert.equal(summary.environment.samples, 101);
  assert(summary.rows.every(row => row.sampleCount === 101));
  return summary;
}

for (const lane of lanes) {
  const list = lane === 'core-axis' ? ['oneOf-5', 'oneOf-10', 'oneOf-20', 'oneOf-40'] : fixtures;
  for (const fixture of list.filter(name => !selected || selected === name)) {
    const settings = lane !== 'core-axis' && /oneOf|if-then/.test(fixture) ? ['off', 'on'] : ['off'];
    for (const validation of settings) for (let run = 1; run <= (firstRunOnly ? 1 : 3); run++) {
      const summaries = {};
      for (const version of run === 2 ? ['new', 'old'] : ['old', 'new']) {
        const stem = `verdict-93c01-${lane}-${fixture}-${validation}-r${run}-${version}`;
        const identity = { lane, fixture, validation, run, version };
        let summary = loadCompleted(stem, identity);
        if (!summary) {
          console.log(`시작 ${stem}`);
          const child = spawn(process.execPath, ['--expose-gc', worker, lane, fixture, validation, String(run), version],
            { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'] });
          let errors = '';
          child.stdout.on('data', chunk => process.stdout.write(chunk));
          child.stderr.on('data', chunk => { errors = (errors + chunk).slice(-10_000_000); });
          const result = await new Promise((resolve, reject) => {
            child.on('error', reject);
            child.on('close', (status, signal) => resolve({ status, signal }));
          });
          if (result.status !== 0) {
            console.error(errors.split('\n').filter(line => line.length < 500).slice(-15).join('\n'));
            assert.equal(result.status, 0, `${stem}: ${result.signal ?? '실행 오류'}`);
          }
          summary = loadCompleted(stem, identity);
        }
        summaries[version] = summary;
        completed++;
      }
      for (const mode of ['mount', 'update', 'update-first', 'update-later'])
        assert.deepEqual(summaries.old.checks[mode], summaries.new.checks[mode], `값/렌더 경로 ${fixture}/${validation}/${mode}`);
      const old = summaries.old.rows.find(row => row.mode === 'update');
      const next = summaries.new.rows.find(row => row.mode === 'update');
      const key = lane === 'react' ? 'profiler' : 'active';
      console.log(`쌍 완료 ${lane} ${fixture} ${validation} r${run}, update 비=${(next.metrics[key].median / old.metrics[key].median).toFixed(4)}, 자연 종료 누적=${completed}`);
    }
  }
}
console.log(`요청한 순차 측정 완료: ${completed} 프로세스`);
