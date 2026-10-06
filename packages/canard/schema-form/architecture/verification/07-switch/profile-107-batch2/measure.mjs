// Sequential CLI adapter; the 104 production verdict clock remains canonical.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.dirname(script);
const repo = path.resolve(directory, '../../../../../../..');
const HEAD = 'e27f4b3b7e4c975adca702539889335f0b478fae';
const [command, phase, ...args] = process.argv.slice(2);
const phases = ['AA', '1-binding-literal', '2-declaration-slice', '3-object-assembly', '4-default-choices'];
assert(phases.includes(phase));
const started = Date.now();
if (command === 'row') {
  const [name, mode] = args;
  for (let run = 1; run <= 9; run++) {
    assert(Date.now() - started < 360000, 'Split rows below eight minutes');
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
  fs.writeFileSync(path.join(directory, `${phase}-driver-${name}-${mode}.json`), JSON.stringify({ phase, name, mode,
    status: 0, signal: null, natural: true, started, ended: Date.now(), elapsedMs: Date.now() - started }, null, 2) + '\n');
  console.log(`${phase} ${name} ${mode}: 9/9 completed`);
} else {
  assert(['build', 'pair'].includes(command));
  let source = fs.readFileSync(path.resolve(directory, '../profile-104-owned/measure.mjs'), 'utf8');
  const replacements = [
    ["const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';", `const HEAD = '${HEAD}';`],
    ['owned104-', `batch107b2-${phase}-`],
    ['fileURLToPath(import.meta.url)', JSON.stringify(script)],
    ["path.join(directory, name + '.json')", `path.join(directory, ${JSON.stringify(phase + '-')} + name + '.json')`],
    ["const [command, ...args] = process.argv.slice(2);", `const command = ${JSON.stringify(command)}; const args = ${JSON.stringify(command === 'pair' ? ['forced', ...args, phase === 'AA' ? 'control' : 'working'] : args)};`],
    ["const content = version === 'head' || version === 'control' ? git(['show', `${HEAD}:${relative}`]) : fs.readFileSync(file, 'utf8');",
      phase === 'AA' ? "const content = git(['show', `${HEAD}:${relative}`]);" : "const content = fs.readFileSync(file, 'utf8');"],
  ];
  for (const [before, after] of replacements) { assert(source.includes(before), before); source = source.split(before).join(after); }
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}
assert(Date.now() - started < 480000);
