// Reuse the committed 104 paired protocol with isolated 105 artifact and bundle names.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.dirname(script);
const sourceFile = path.resolve(directory, '../profile-104-owned/measure.mjs');
let source = fs.readFileSync(sourceFile, 'utf8');
const replacements = [
  ["const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';", "const HEAD = 'e633fefefb1efcf81302ccf3efc0b51431fb2cee';"],
  ['owned104-', 'path105-'],
  ['fileURLToPath(import.meta.url)', JSON.stringify(script)],
];
for (const [before, after] of replacements) {
  assert(source.includes(before), before);
  source = source.split(before).join(after);
}
assert(!source.includes('owned104-'));
source = source.replace('save(`build-${version}', 'save(`path105-build-${version}');
if (process.argv[2] === 'row') {
  const [, , , name, mode] = process.argv;
  const started = Date.now();
  for (const regime of ['noise-before', 'forced', 'steady', 'noise-after']) {
    const runs = regime === 'steady' ? 6 : 3;
    for (let run = 1; run <= runs; run++) {
      assert(Date.now() - started < 360000, 'Split row before eight minutes');
      const args = ['--expose-gc', script, 'pair', regime, name, mode, String(run),
        regime.startsWith('noise') ? 'control' : 'working'];
      const worker = spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 5_000_000,
        env: { ...process.env, NODE_ENV: 'production' } });
      assert.equal(worker.signal, null);
      assert.equal(worker.status, 0, worker.stderr);
      console.log(worker.stdout.trim());
    }
  }
  console.log(JSON.stringify({ row: [name, mode], elapsedMs: Date.now() - started }));
} else await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
