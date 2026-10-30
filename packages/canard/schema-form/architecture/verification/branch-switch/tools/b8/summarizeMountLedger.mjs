// CLI-only portable report; does not execute or repeat performance samples.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { summarizeMountResults } from './helpers/summarizeMountResults.mjs';
import { verifyMountInputs } from './helpers/verifyMountInputs.mjs';

assert.equal(process.argv.length, 3);
assert.ok(process.argv[2].startsWith('--root='));
const root = path.resolve(process.argv[2].slice(7));
const { inputs, sha256 } = verifyMountInputs(root);
const raw = JSON.parse(fs.readFileSync(path.join(root, 'mount-results.json')));
const smoke = JSON.parse(fs.readFileSync(path.join(root, 'mount-smoke.json')));
const formal = JSON.parse(
  fs.readFileSync(path.join(root, 'formal-start.json')),
);
assert.equal(raw.inputsSha256, sha256);
assert.equal(smoke.inputsSha256, sha256);
assert.equal(formal.inputsSha256, sha256);
const summary = summarizeMountResults(inputs, raw, smoke);
fs.writeFileSync(
  path.join(root, 'mount-summary.json'),
  JSON.stringify(summary, null, 2) + '\n',
);
console.log('B8_MOUNT_SUMMARY_OK');
