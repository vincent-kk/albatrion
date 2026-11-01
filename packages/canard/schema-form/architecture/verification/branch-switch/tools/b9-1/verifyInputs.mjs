import assert from 'node:assert/strict';
import path from 'node:path';

import { verifyInputs as verifyBundles } from '../b4-2/verifyInputs.mjs';
import { digest } from '../b9-0/files.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';

/** Verify immutable product, stage-engine and runner bytes without executing samples. */
export function verifyInputs(root) {
  const inputs = verifyBundles(root);
  for (const lane of ['A', 'B'])
    for (const [name, expected] of Object.entries(inputs.stageEngines[lane]))
      assert.deepEqual(
        digest(path.join(getStageRoot(root, lane), 'engines', name)),
        expected,
      );
  for (const [relative, expected] of Object.entries(inputs.tools))
    assert.deepEqual(
      digest(new URL('../../../../../' + relative, import.meta.url)),
      expected,
    );
  return inputs;
}
