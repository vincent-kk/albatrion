// CLI smoke verifies hashes, permissions, AJV resolution and one process per bundle.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { digest, json, verifyInputs } from './files.mjs';

const root = path.resolve(process.argv[2]);
const inputs = verifyInputs(root);
const pkg = fileURLToPath(new URL('../../../../../', import.meta.url));
const require = createRequire(path.join(pkg, 'package.json'));
const plugin = require.resolve('@canard/schema-form-ajv8-plugin');
assert.equal(digest(plugin).sha256, inputs.plugin.sha256);
await import(plugin);
const modes = {
  dist: 'engines/dist.mjs',
  legacy: 'engines/legacy.mjs',
  wrapped: 'stages/scratch/wrapped.mjs',
  unwrapped: 'stages/scratch/unwrapped.mjs',
  supplemental: 'stages/scratch/supplemental.mjs',
  gap: 'stages/scratch/gap.mjs',
  diagnostic: 'stages/scratch/diagnostic.mjs',
};
const results = [];
for (const [mode, file] of Object.entries(modes)) {
  fs.accessSync(path.join(root, file), fs.constants.R_OK);
  const result = JSON.parse(
    execFileSync(
      process.execPath,
      [
        fileURLToPath(new URL('./smoke.mjs', import.meta.url)),
        root,
        file,
        mode,
      ],
      { encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' } },
    ),
  );
  assert.equal(result.timed, false);
  assert.equal(result.rows.length, 6);
  results.push(result);
}
json(path.join(root, 'untimed-load-check.json'), {
  timed: false,
  inputsSha256: digest(path.join(root, 'inputs.json')).sha256,
  plugin: inputs.plugin,
  results,
});
const operations = results
  .flatMap((result) => result.rows)
  .reduce((sum, row) => sum + row.operations, 0);
console.log('B9_0_UNTIMED_LOAD_OK bundles=7 rows=6 operations=' + operations);
