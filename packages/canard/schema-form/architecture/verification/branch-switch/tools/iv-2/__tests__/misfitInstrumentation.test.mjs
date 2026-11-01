import assert from 'node:assert/strict';
import { test } from 'node:test';

import { instrumentDetails } from '../../b9-0/instrumentDetails.mjs';

test('both baseline and lazy candidate guards keep one supplemental misfit owner', () => {
  for (const guard of [
    '!misfitIndex',
    '!misfitIndex && context.root.runtime.misfitPaths.size > 0',
  ]) {
    const input = `const finalizeExits = () => { if (${guard}) { misfitIndex = new Map(); } };`;
    const result = instrumentDetails(input, 'finalizeExits.ts', 'supplemental');
    assert.equal(
      result.sites.filter((site) => site.name === 'misfitIndexBuild').length,
      1,
    );
    assert.ok(result.contents.includes(`if (${guard})`));
    assert.equal(
      instrumentDetails(input, 'finalizeExits.ts', 'wrapped').contents,
      input,
    );
  }
});
