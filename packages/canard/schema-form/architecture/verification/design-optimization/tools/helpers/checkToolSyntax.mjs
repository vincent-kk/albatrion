// Invoked by Node CLI from the repository root; checks tool syntax and the tools-only change boundary.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pending = [fileURLToPath(new URL('../', import.meta.url))];
let count = 0;
while (pending.length) {
  const directory = pending.pop();
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) pending.push(target);
    else if (entry.name.endsWith('.mjs')) {
      const result = spawnSync(process.execPath, ['--check', target], {
        encoding: 'utf8',
      });
      assert.equal(result.status, 0, `${target}: ${result.stderr}`);
      count++;
    }
  }
}
const files = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    'b8db53997',
    '--',
    'packages/canard/schema-form/src',
    'packages/canard/schema-form/dist',
  ],
  { encoding: 'utf8' },
);
assert.equal(files, '', 'Product source, tests and dist must remain unchanged');
console.log(`B0_SYNTAX_OK files=${count} product-diff=0`);
