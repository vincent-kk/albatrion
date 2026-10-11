// Finite child-process evidence for differential success and deliberately broken engines.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const [phase, mode, comparator, expected = 'pass'] = process.argv.slice(2);
const started = Date.now();
const result = spawnSync(process.execPath, [path.join(directory, 'differential.mjs'), phase, mode, comparator],
  { encoding: 'utf8', maxBuffer: 5_000_000, env: { ...process.env, NODE_ENV: mode, GIT_OPTIONAL_LOCKS: '0' } });
const elapsedMs = Date.now() - started;
assert.equal(result.signal, null); assert(elapsedMs < 480000);
const log = result.stdout + result.stderr;
if (expected === 'pass') {
  assert.equal(result.status, 0, log.slice(-3000));
  assert(log.includes('EVENT110_DIFF_OK'));
  for (const line of result.stdout.split('\n')) if (line.startsWith('NATIVE_ARTIFACT ')) console.log(line);
} else {
  assert.equal(expected, 'fail'); assert.equal(result.status, 1);
  assert(log.includes('AssertionError') && /runtime differential differs|before a commit revision|handed-out/.test(log), log);
}
const record = { phase, mode, comparator, expected, exitCode: result.status, signal: result.signal,
  started, ended: Date.now(), elapsedMs, natural: true,
  summary: log.split('\n').filter(line => !line.startsWith('NATIVE_ARTIFACT ') &&
    /EVENT110_DIFF_OK|AssertionError|runtime differential differs|handed-out/.test(line)) };
for (const [name, text] of [[`probe-${phase}-${mode}-${comparator}.json`, JSON.stringify(record, null, 2) + '\n'],
  [`probe-${phase}-${mode}-${comparator}.txt`, log]]) {
  assert(Buffer.byteLength(text) <= 5_000_000);
  console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file: path.join(directory, name), text }));
}
console.log(JSON.stringify(record));
console.log(expected === 'pass' ? 'DIFFERENTIAL_PROBE_OK' : 'BROKEN_VARIANT_REJECTED');
