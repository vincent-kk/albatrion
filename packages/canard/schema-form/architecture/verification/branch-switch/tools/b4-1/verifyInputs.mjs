import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { getStageRoot } from '../window/getStageRoot.mjs';

/** Verify prepared bundle bytes against the manifest, without running a device.
 * @param {string} root External prepared device directory.
 * @returns {object} The verified input manifest; throws on missing or changed bytes.
 */
export function verifyInputs(root) {
  const inputs = JSON.parse(
    fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'),
  );
  assert.ok(
    inputs.files && inputs.stageBundles,
    'Prepare inputs with stage bundle hashes',
  );
  for (const lane of ['A', 'B']) {
    const stages = getStageRoot(root, lane) + '/stages/scratch';
    for (const [directory, names, expected] of [
      [
        path.join(root, 'bundles', lane),
        ['index.node.mjs', 'index.mjs', 'index.d.ts'],
        inputs.files[lane],
      ],
      [
        stages,
        [
          'wrapped.mjs',
          'unwrapped.mjs',
          'supplemental.mjs',
          'instrumentation.json',
        ],
        inputs.stageBundles[lane],
      ],
    ])
      for (const name of names) {
        const bytes = fs.readFileSync(path.join(directory, name));
        assert.equal(
          bytes.length,
          expected[name].bytes,
          'Input bytes: ' + name,
        );
        assert.equal(
          createHash('sha256').update(bytes).digest('hex'),
          expected[name].sha256,
          'Input hash: ' + name,
        );
      }
  }
  return inputs;
}
