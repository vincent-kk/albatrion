import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { digest, read } from '../b9-0/files.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';

/**
 * Recheck every frozen runtime and tool before or after a measurement window.
 * @param {string} root - Prepared IV-0 .noindex directory
 * @param {boolean} verifyTools - False only when archiving historical inputs after review edits
 * @returns Verified input manifest
 */
export function verifyInputs(root, verifyTools = true) {
  const inputs = read(path.join(root, 'inputs.json'));
  const packageDir = fileURLToPath(new URL('../../../../../', import.meta.url));
  assert.equal(inputs.node, process.version);
  assert.deepEqual(inputs.config, {
    runs: 10,
    warmups: 20,
    samples: 100,
    quality: 'legacy',
  });
  for (const [file, hash] of Object.entries(inputs.files)) {
    const match = /^([AB])\/(engines|stages)\/(.+)$/.exec(file);
    const location = match
      ? path.join(
          getStageRoot(root, match[1]),
          match[2],
          ...(match[2] === 'stages' ? ['scratch'] : []),
          match[3],
        )
      : path.join(root, file);
    assert.deepEqual(digest(location), hash, file);
  }
  if (verifyTools)
    for (const [file, hash] of Object.entries(inputs.tools))
      assert.deepEqual(digest(path.join(packageDir, file)), hash, file);
  return inputs;
}
