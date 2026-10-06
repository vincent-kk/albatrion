// Run one designated package check and retain bounded logs; every child exits naturally.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
let source = fs.readFileSync(path.join(directory, 'verify-revision-initial-order.mjs'), 'utf8')
  .replace('path.dirname(fileURLToPath(import.meta.url))', JSON.stringify(directory))
  .replaceAll('revision102-order-verify-', process.env.FREEZE103_VERIFY_HEAD === '1'
    ? 'freeze103-head-verify-' : 'freeze103-verify-');
assert(source.includes("vitest: ['npx', 'vitest'"));
source = source.replace("  tsc: ['npx'", "  production: ['npx', 'vitest', 'run', '--project', 'production', '--reporter=dot'],\n  tsc: ['npx'");
source = source.replace('env: { ...process.env,',
  "env: { ...process.env, ...(name === 'production' ? { NODE_ENV: 'production' } : {}),");
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
