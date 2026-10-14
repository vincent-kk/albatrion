// CLI coordinator: one fresh worker; JSON stdout is saved through native artifact writes.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const work = path.dirname(fileURLToPath(import.meta.url));
const worker = path.resolve(work, '../tools/measure-verdict-95c01.mjs');
const head = '61e97d3664b03010339f793d5f44741345894c96';
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const [fixture, validation, run, version] = process.argv.slice(2);
assert.equal(process.argv.length, 6);
assert(['array-100', 'flat-100'].includes(fixture));
assert.equal(validation, 'off');
assert(['1', '2', '3'].includes(run) && ['old', 'new'].includes(version));
assert.equal(process.version, 'v26.10.0');
assert.equal(process.env.TMPDIR, bundles);
assert.equal(process.env.NODE_DISABLE_COMPILE_CACHE, '1');
assert(fs.statSync(bundles).isDirectory());
const started = Date.now();
console.error(`START ${fixture}/${validation}/r${run}/${version}`);
const child = spawnSync(process.execPath, ['--expose-gc', worker, fixture, validation, run, version,
  `--head=${head}`, '--warmup=20'], { encoding: 'utf8', maxBuffer: 5_000_000 });
assert.ifError(child.error);
assert.equal(child.signal, null);
assert.equal(child.status, 0, child.stderr);
const elapsedMs = Date.now() - started;
assert(elapsedMs < 480_000);
const record = JSON.parse(child.stdout);
record.summary.workerExit = { code: child.status, signal: child.signal, natural: true, elapsedMs };
assert.equal(record.summary.warmup, 20);
assert.equal(record.summary.environment.head, head);
console.error(`END ${fixture}/${validation}/r${run}/${version}: ${elapsedMs} ms; natural exit`);
console.log(JSON.stringify(record));
