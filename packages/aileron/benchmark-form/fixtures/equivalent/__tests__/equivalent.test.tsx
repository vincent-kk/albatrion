import { describe, expect, it } from 'vitest';

import { equivalentFixtures } from '../index';
import { captureEquivalentPaths } from '../utils/captureEquivalentPaths';

describe('equivalent legacy/workspace forms', () => {
  for (const fixture of equivalentFixtures) {
    it(
      fixture.name,
      async () => {
        const legacy = await captureEquivalentPaths(fixture, '0.16.0');
        const workspace = await captureEquivalentPaths(fixture, 'latest');
        expect(legacy).toHaveLength(fixture.interactions.length + 1);
        for (const paths of legacy) expect(paths.length).toBeGreaterThan(0);
        expect(workspace).toEqual(legacy);
      },
      120_000,
    );
  }
});
