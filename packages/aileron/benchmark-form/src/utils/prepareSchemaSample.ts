import type { EquivalentFixture } from '../../fixtures/equivalent/types';

/**
 * Select schema cache identity before entering a measurement window.
 * @param fixture - JSON-only authored schemas and the shared interaction sequence
 * @param lane - Warm retains identity; cold clones each version for one sample
 * @returns The original fixture or independent schema identities with identical content
 */
export const prepareSchemaSample = (
  fixture: EquivalentFixture,
  lane: 'warm' | 'cold',
): EquivalentFixture =>
  lane === 'warm'
    ? fixture
    : {
        ...fixture,
        workspace: structuredClone(fixture.workspace),
        legacy: structuredClone(fixture.legacy),
      };
