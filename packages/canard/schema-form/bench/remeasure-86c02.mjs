// Reproduction entry: serialize phase measurements so engines never compete for CPU.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(pkg, '../../..');
const runs = [
  ['core-traced', []],
  ['core-plain', ['--plain']],
  ['render-plain-production', ['--render', '--production', '--plain']],
  ['render-plain', ['--render', '--plain']],
  ['render-traced-production', ['--render', '--production']],
];
const selected = process.argv.slice(2);
if (selected.includes('iv')) {
  const run = spawnSync(process.execPath, ['--expose-gc',
    path.join(pkg, 'bench/branchless-phase-diagnosis.mjs'), '--render', '--production', '--plain'], {
    cwd: repo, stdio: 'inherit', env: { ...process.env,
      PHASE_SOURCE_REF: 'b44dc7ebf', PHASE_CANDIDATES: 'i,ii,iii,iv',
      PHASE_FIXTURES: 'array-100,array-500,array-1000',
      PHASE_OUTPUT: '86c02-iv', PHASE_WARMUP: '12', PHASE_SAMPLES: '101' },
  });
  if (run.status !== 0) process.exit(run.status ?? 1);
}
for (const [name, args] of runs) {
  if (selected.length && !selected.includes(name)) continue;
  console.log(`86C-02 start ${name}`);
  const run = spawnSync(process.execPath, ['--expose-gc',
    path.join(pkg, 'bench/branchless-phase-diagnosis.mjs'), ...args], {
    cwd: repo, stdio: 'inherit', env: { ...process.env,
      PHASE_OUTPUT: '86c02-final', PHASE_WARMUP: '12', PHASE_SAMPLES: '101' },
  });
  if (run.status !== 0) process.exit(run.status ?? 1);
  console.log(`86C-02 complete ${name}`);
}
