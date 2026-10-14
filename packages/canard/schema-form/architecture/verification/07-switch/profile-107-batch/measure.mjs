// Sequential CLI adapter; the committed 104 production verdict clock remains canonical.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.dirname(script);
const repo = path.resolve(directory, '../../../../../../..');
const HEAD = '9d1ea600a1916e66b0389318d81e1c3ee23ad0d3';
const [command, phase, ...args] = process.argv.slice(2);
assert(['AA', '1-build-own', '2-child-input-literal', '3-path-strings', '4-template-key'].includes(phase));
const started = Date.now();
if (command === 'row') {
  const [name, mode] = args;
  for (let run = 1; run <= 9; run++) {
    assert(Date.now() - started < 360000, 'Split batches below eight minutes');
    const begin = Date.now();
    const worker = spawnSync(process.execPath, ['--expose-gc', script, 'pair', phase, name, mode, String(run)], {
      cwd: repo, encoding: 'utf8', maxBuffer: 5_000_000,
      env: { ...process.env, NODE_ENV: 'production', GIT_OPTIONAL_LOCKS: '0' },
    });
    assert.equal(worker.signal, null);
    assert.equal(worker.status, 0, worker.stderr || worker.stdout);
    assert(Date.now() - begin < 480000);
    console.log(worker.stdout.trim());
  }
  const record = { phase, name, mode, status: 0, signal: null, natural: true,
    started, ended: Date.now(), elapsedMs: Date.now() - started };
  fs.writeFileSync(path.join(directory, `${phase}-driver-${name}-${mode}.json`), JSON.stringify(record, null, 2) + '\n');
  console.log(JSON.stringify(record));
} else {
  assert(['build', 'pair'].includes(command));
  if (command === 'build') assert(['head', 'control', 'working'].includes(args[0]));
  let source = fs.readFileSync(path.resolve(directory, '../profile-104-owned/measure.mjs'), 'utf8');
  const replacements = [
    ["const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';", `const HEAD = '${HEAD}';`],
    ['owned104-', `batch107-${phase}-`],
    ['fileURLToPath(import.meta.url)', JSON.stringify(script)],
    ["path.join(directory, name + '.json')", `path.join(directory, ${JSON.stringify(phase + '-')} + name + '.json')`],
    ["const [command, ...args] = process.argv.slice(2);", `const command = ${JSON.stringify(command)}; const args = ${JSON.stringify(command === 'pair' ? ['forced', ...args, phase === 'AA' ? 'control' : 'working'] : args)};`],
    ["const content = version === 'head' || version === 'control' ? git(['show', `${HEAD}:${relative}`]) : fs.readFileSync(file, 'utf8');",
      phase === 'AA' ? "const content = git(['show', `${HEAD}:${relative}`]);" : "const content = fs.readFileSync(file, 'utf8');"],
  ];
  for (const [before, after] of replacements) {
    assert(source.includes(before), before);
    source = source.split(before).join(after);
  }
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}
assert(Date.now() - started < 480000);
