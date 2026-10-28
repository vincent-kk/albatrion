// CLI compares the second designated product build against the untouched base build.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { digest, json, read, verifyInputs } from './files.mjs';

const root = path.resolve(process.argv[2]);
const inputs = verifyInputs(root);
const pkg = fileURLToPath(new URL('../../../../../', import.meta.url));
const expected = read(path.join(root, 'base-dist-hashes.json'));
const actual = Object.fromEntries(
  Object.keys(expected).map((name) => [
    name,
    digest(path.join(pkg, 'dist', name)),
  ]),
);
assert.deepEqual(actual, expected, 'Base and final dist bytes');
const sourceDiff = execFileSync(
  'git',
  ['diff', '--stat', inputs.base, '--', 'packages/canard/schema-form/src'],
  { cwd: path.resolve(pkg, '../../..'), encoding: 'utf8' },
).trim();
assert.equal(sourceDiff, '');
json(path.join(root, 'build-verification.json'), {
  base: inputs.base,
  sourceDiff,
  baseDist: expected,
  finalDist: actual,
  identical: true,
  designatedBuild: 'yarn workspace @canard/schema-form build',
});
console.log('B9_0_BUILD_IDENTICAL');
