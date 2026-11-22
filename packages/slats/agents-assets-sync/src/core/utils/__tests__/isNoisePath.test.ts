import { expect, it } from 'vitest';

import { isNoisePath } from '../isNoisePath.js';

it('protects interrupted atomic-write scratch files from hashing and orphan deletion', () => {
  expect(isNoisePath('skills/s/.agents-assets-sync-run/document')).toBe(true);
  expect(isNoisePath('skills/s/agents-assets-sync-guide.md')).toBe(false);
});
