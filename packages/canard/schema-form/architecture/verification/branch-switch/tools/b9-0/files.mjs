// Shared immutable-input checks; reports use relative artifact names only.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const json = (file, value) =>
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
export const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
export const digest = (file) => {
  const bytes = fs.readFileSync(file);
  return {
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
};
export function verifyInputs(root) {
  const inputs = read(path.join(root, 'inputs.json'));
  assert.equal(inputs.node, process.version);
  assert.deepEqual(inputs.config, {
    runs: 10,
    warmups: 20,
    samples: 100,
    quality: 'legacy',
  });
  for (const [file, hash] of Object.entries(inputs.files))
    assert.deepEqual(digest(path.join(root, file)), hash, file);
  return inputs;
}
