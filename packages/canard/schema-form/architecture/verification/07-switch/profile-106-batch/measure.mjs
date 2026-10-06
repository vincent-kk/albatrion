// Reuse the committed verdict worker; CLI stage/base select isolated evidence and bundles.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.dirname(script);
const head = '552a975abd8afa6ef914e218832bd8bfddf03d5b';
let source = fs.readFileSync(path.resolve(directory, '../profile-104-owned/measure.mjs'), 'utf8');
for (const [before, after] of [
  ["const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';", `const HEAD = '${head}';\nconst BASE = process.env.BATCH106_BASE ?? 'head';`],
  ['owned104-', 'batch106-'],
  ['fileURLToPath(import.meta.url)', JSON.stringify(script)],
  ["HEAD, regime, name, mode, run, comparator, freshProcess: true", "HEAD, environment: { node: process.version, v8: process.versions.v8, execPath: process.execPath }, regime, name, mode, run, comparator, freshProcess: true"],
  ["path.join(directory, name + '.json')", "path.join(directory, (process.env.BATCH106_STAGE ? process.env.BATCH106_STAGE + '-' : '') + name + '.json')"],
  ["head: require(bundle('head'))", 'head: require(bundle(BASE))'],
  ["head: hash(fs.readFileSync(bundle('head')))", 'head: hash(fs.readFileSync(bundle(BASE)))'],
]) {
  assert(source.includes(before), before);
  source = source.split(before).join(after);
}

if (process.argv[2] === 'row') {
  const [, , , stage, name, mode, base, candidate] = process.argv;
  const started = Date.now();
  for (let run = 1; run <= 9; run++) {
    assert(Date.now() - started < 360000, 'Split before eight minutes');
    const result = spawnSync(process.execPath,
      ['--expose-gc', script, 'pair', 'forced', name, mode, String(run), candidate], {
        env: { ...process.env, NODE_ENV: 'production', BATCH106_STAGE: stage, BATCH106_BASE: base },
        encoding: 'utf8', maxBuffer: 5_000_000,
      });
    assert.equal(result.signal, null);
    assert.equal(result.status, 0, result.stderr);
    console.log(result.stdout.trim());
  }
  assert(Date.now() - started < 480000);
  const record = { stage, name, mode, runs: 9, base, candidate, status: 0, signal: null,
    started, ended: Date.now(), elapsedMs: Date.now() - started };
  fs.writeFileSync(path.join(directory, `driver-${stage}-${name}-${mode}.json`), JSON.stringify(record, null, 2) + '\n');
  console.log(JSON.stringify(record));
} else {
  assert(['build', 'pair'].includes(process.argv[2]));
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}
