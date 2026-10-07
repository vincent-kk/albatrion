// Reuse the committed 104 verdict clock; only artifact names and source snapshots differ.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.dirname(script);
const pkg = path.resolve(directory, '../../../..');
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
assert.equal(process.version, 'v26.10.0');
assert.equal(process.env.TMPDIR, scratch);
assert.equal(process.env.NODE_DISABLE_COMPILE_CACHE, '1');
const rows = [
  ['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'], ['sample-0', 'mount'],
  ...['sample-0', 'flat-100', 'flat-500', 'nested-d5-f4', 'oneOf-40'].flatMap(name => [[name, 'first'], [name, 'later']]),
];
const phase = process.env.VALUE110_PHASE ?? 'builds';
fs.mkdirSync(path.join(directory, phase), { recursive: true });
fs.mkdirSync(scratch, { recursive: true });
let source = fs.readFileSync(path.join(directory, '../profile-104-owned/measure.mjs'), 'utf8');
const replacements = [
  ["const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';", "const HEAD = 'ba2571b86';"],
  ["assert.equal(git(['rev-parse', 'HEAD']).trim(), HEAD);", "assert.equal(git(['rev-parse', 'HEAD']).trim().slice(0,9), HEAD);"],
  ['fileURLToPath(import.meta.url)', JSON.stringify(script)],
  ['const directory = path.dirname(' + JSON.stringify(script) + ');', 'const directory = ' + JSON.stringify(path.join(directory, phase)) + ';'],
  ["const pkg = path.resolve(directory, '../../../..');", 'const pkg = ' + JSON.stringify(pkg) + ';'],
  ['owned104-', 'value110-'],
  ["head: require(bundle('head')), working: require(bundle(comparator))", "head: require(bundle(process.env.VALUE110_BASE ?? 'head')), working: require(bundle(comparator))"],
  ["head: hash(fs.readFileSync(bundle('head'))), working:", "head: hash(fs.readFileSync(bundle(process.env.VALUE110_BASE ?? 'head'))), working:"],
];
for (const [before, after] of replacements) {
  assert(source.includes(before), before);
  source = source.split(before).join(after);
}

if (process.argv[2] === 'batch110') {
  const [, , , requestedPhase, fromText, toText, base, candidate] = process.argv;
  const started = Date.now();
  const records = [];
  for (let row = Number(fromText); row < Number(toText); row++) {
    const [name, mode] = rows[row];
    for (let run = 1; run <= 9; run++) {
      assert(Date.now() - started < 390000, 'Split batch before eight minutes');
      const begin = Date.now();
      const worker = spawnSync(process.execPath, ['--expose-gc', script, 'pair', 'forced', name, mode, String(run), candidate], {
        cwd: path.resolve(pkg, '../../..'), encoding: 'utf8', maxBuffer: 5_000_000,
        env: { ...process.env, NODE_ENV: 'production', VALUE110_PHASE: requestedPhase, VALUE110_BASE: base },
      });
      records.push({ name, mode, run, started: begin, ended: Date.now(), status: worker.status, signal: worker.signal });
      assert.equal(worker.signal, null);
      assert.equal(worker.status, 0, worker.stderr);
      console.log(requestedPhase + ' ' + worker.stdout.trim());
    }
  }
  assert(Date.now() - started < 480000);
  const record = { phase: requestedPhase, from: Number(fromText), to: Number(toText), base, candidate, started, ended: Date.now(), workers: records };
  fs.mkdirSync(path.join(directory, requestedPhase), { recursive: true });
  fs.writeFileSync(path.join(directory, requestedPhase, `batch-${fromText}-${toText}.json`), JSON.stringify(record, null, 2) + '\n');
} else {
  assert(['build', 'pair'].includes(process.argv[2]));
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}
