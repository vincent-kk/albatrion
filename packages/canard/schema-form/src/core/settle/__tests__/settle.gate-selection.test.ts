import { describe, expect, it } from 'vitest';

import { gateSelectionCases } from './fixtures/gateSelectionCases';
import { installGateSelectionShadow } from './helpers/installGateSelectionShadow';
import { runGateSelectionCase } from './helpers/runGateSelectionCase';

// filid:contract settle-gate-selection-differential
describe('gate selection verifier histories on full evaluation', () => {
  it.each(gateSelectionCases)('$name', fixture => {
    const expected = runGateSelectionCase(fixture);
    const shadow = installGateSelectionShadow();
    try {
      expect(runGateSelectionCase(fixture)).toEqual(expected);
      expect(shadow.violations).toEqual([]);
      expect(shadow.count).toBeGreaterThan(0);
    } finally { shadow.restore(); }
  });
});
