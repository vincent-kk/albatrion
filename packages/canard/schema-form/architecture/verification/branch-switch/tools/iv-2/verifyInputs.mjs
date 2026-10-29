import assert from 'node:assert/strict';
import path from 'node:path';

import { digest } from '../b9-0/files.mjs';
import { verifyInputs as verifyBaseInputs } from '../b9-1/verifyInputs.mjs';

/** Verify the inherited A/B device and every additional frozen IV-2 bundle. */
export function verifyInputs(root) {
  const inputs = verifyBaseInputs(root);
  for (const lane of ['A', 'B'])
    for (const [mode, record] of Object.entries(inputs.diagnostics[lane].modes))
      assert.deepEqual(
        digest(path.join(root, 'diagnostics', lane, mode + '.mjs')),
        record.hash,
      );
  return inputs;
}
