// CLI coordinator: stdout JSONL is consumed by native artifact writes; children finish sequentially.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const worker = path.join(path.dirname(fileURLToPath(import.meta.url)), 'measure-verdict-95c01.mjs');
const fixtures = ['sample-0', 'sample-1', 'sample-2', 'sample-3', 'flat-50', 'flat-100', 'flat-500',
  'nested-d3-f4', 'nested-d5-f4', 'array-100', 'array-500', 'array-1000',
  'computed-visible-derived', 'oneOf-5', 'oneOf-10', 'oneOf-20', 'oneOf-40', 'if-then'];
const jobs = [];
for (const fixture of fixtures) for (const validation of /oneOf|if-then/.test(fixture) ? ['off', 'on'] : ['off']) {
  for (const run of [1, 2, 3]) for (const version of run === 2 ? ['new', 'old'] : ['old', 'new']) {
    jobs.push({ fixture, validation, run, version });
  }
}
assert.equal(jobs.length, 138);
if (process.argv.includes('--plan')) console.log(JSON.stringify(jobs));
else for (const job of jobs) {
  const result = spawnSync(process.execPath, ['--expose-gc', worker,
    job.fixture, job.validation, String(job.run), job.version], { encoding: 'utf8', maxBuffer: 5_000_000 });
  assert.ifError(result.error);
  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, 0, result.stderr);
  const record = JSON.parse(result.stdout);
  assert.equal(record.summary.version, job.version);
  record.summary.workerExit = { code: result.status, signal: result.signal, natural: true };
  console.log(JSON.stringify(record));
}
