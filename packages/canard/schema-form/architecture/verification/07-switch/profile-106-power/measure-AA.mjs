// CLI adapter for 105C-01; the committed 104 clock and fixture protocol remain canonical.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.dirname(script);
const [command, candidate, ...args] = process.argv.slice(2);
assert(['AA', 'P', 'C'].includes(candidate));
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const scratch = path.join(bundles, 'path106-scratch');
const started = Date.now();

if (command === 'row') {
  const [name, mode] = args;
  for (let run = 1; run <= 9; run++) {
    assert(Date.now() - started < 360000, 'Split row before eight minutes');
    const worker = spawnSync(process.execPath,
      ['--expose-gc', script, 'pair', candidate, name, mode, String(run)],
      { env: { ...process.env, NODE_ENV: 'production' }, encoding: 'utf8', maxBuffer: 5_000_000 });
    assert.equal(worker.signal, null);
    assert.equal(worker.status, 0, worker.stderr);
    console.log(worker.stdout.trim());
  }
  const evidence = { candidate, name, mode, status: 0, signal: null,
    started, ended: Date.now(), elapsedMs: Date.now() - started };
  fs.writeFileSync(path.join(directory, `driver-${candidate}-${name}-${mode}.json`), JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence));
} else {
  assert(['build', 'pair'].includes(command));
  if (command === 'build') assert(['head', 'control', 'working'].includes(args[0]));
  let source = fs.readFileSync(path.resolve(directory, '../profile-104-owned/measure.mjs'), 'utf8');
  const prefix = `power106-${candidate}-`;
  const replacements = [
    ["const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';",
     "const HEAD = '5e8f34625b64b84dddd58239f31969afb71c862c';"],
    ['owned104-', prefix],
    ['fileURLToPath(import.meta.url)', JSON.stringify(script)],
    ['save(`build-${version}', `save(\`${prefix}build-\${version}`],
    ['save(`process-${[command, ...args].join', `save(\`${prefix}process-\${[command, ...args].join`],
    ["const [command, ...args] = process.argv.slice(2);",
      command === 'build'
        ? `const command = 'build'; const args = ${JSON.stringify(args)};`
        : `const command = 'pair'; const args = ${JSON.stringify(['forced', ...args, candidate === 'AA' ? 'control' : 'working'])};`],
  ];
  for (const [before, after] of replacements) {
    assert(source.includes(before), before);
    source = source.split(before).join(after);
  }
  if (candidate === 'C') {
    const before = 'const bundle = (version, development = false) =>';
    assert(source.includes(before));
    source = source.replace(before, 'const unusedBundle = (version, development = false) =>');
    source = source.replace('const median = values =>',
      "const bundle = version => path.join(bundles, `child105-${version}.cjs`);\nconst median = values =>");
  }
  if (candidate === 'P' && command === 'build' && args[0] === 'working') {
    const before = "fs.readFileSync(file, 'utf8')";
    const after = "git(['show', `${HEAD}:${relative}`])";
    assert(source.includes(before));
    source = source.replace(before,
      `fs.existsSync(path.join(${JSON.stringify(scratch)}, relative)) ? fs.readFileSync(path.join(${JSON.stringify(scratch)}, relative), 'utf8') : ${after}`);
  }
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}
