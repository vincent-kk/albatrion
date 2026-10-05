// Loaded directly by node; every measurement child exits before the next starts.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const runner = path.join(directory, 'measure-round-90-baseline.mjs');
const cwd = path.resolve(directory, '../../../..');
const fixtures = ['flat-500', 'nested-d5-f4', 'array-1000',
  'computed-visible-derived', 'oneOf-20'];

for (const fixture of ['flat-500', 'nested-d5-f4'])
  for (const variant of ['H', 'W'])
    execFileSync(process.execPath,
      ['--expose-gc', runner, fixture, '1', '--paired', variant, '--round93', '--structures'],
      { cwd, stdio: 'inherit' });

for (const fixture of fixtures)
  for (let run = 1; run <= 3; run++) {
    const order = run === 2 ? ['W', 'H'] : ['H', 'W'];
    for (const variant of order)
      execFileSync(process.execPath,
        ['--expose-gc', runner, fixture, String(run), '--paired', variant, '--round93'],
        { cwd, stdio: 'inherit' });
  }
execFileSync(process.execPath, [runner, '--summarize-paired', '--round93'],
  { cwd, stdio: 'inherit' });
