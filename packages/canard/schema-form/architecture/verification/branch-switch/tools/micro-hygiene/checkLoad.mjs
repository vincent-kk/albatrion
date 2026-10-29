// Untimed public A44/B44/legacy36 and nine stage modes precede every measurement.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { verifyInputs } from './verifyInputs.mjs';

const root = path.resolve(process.argv[2]);
verifyInputs(root);
execFileSync(
  process.execPath,
  [fileURLToPath(new URL('../b9-1/checkLoad.mjs', import.meta.url)), root],
  { stdio: 'inherit' },
);
verifyInputs(root);
console.log('MICRO_HYGIENE_UNTIMED_SMOKE_OK');
