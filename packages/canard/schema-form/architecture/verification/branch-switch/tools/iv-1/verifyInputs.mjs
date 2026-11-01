import assert from 'node:assert/strict';
import path from 'node:path';

import { digest } from '../b9-0/files.mjs';
import { verifyInputs as verifyBaseInputs } from '../b9-1/verifyInputs.mjs';

/** Verify the inherited A/B device and every additional frozen IV-1 bundle. */
export function verifyInputs(root) {
  const inputs = verifyBaseInputs(root);
  assert.deepEqual(
    digest(path.join(root, 'diagnostics/scope-builder.mjs')),
    inputs.scopeBuilder,
  );
  for (const [mode, record] of Object.entries(inputs.diagnostics.modes))
    assert.deepEqual(
      digest(path.join(root, 'diagnostics', mode + '.mjs')),
      record.hash,
    );
  return inputs;
}
