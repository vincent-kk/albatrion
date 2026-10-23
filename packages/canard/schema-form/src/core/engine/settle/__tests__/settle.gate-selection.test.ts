import { describe, expect, it } from 'vitest';

import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { gateSelectionCases } from './fixtures/gateSelectionCases';
import { installGateSelectionShadow } from './helpers/installGateSelectionShadow';
import { runGateSelectionCase } from './helpers/runGateSelectionCase';
import { withoutGateVisits } from './helpers/withoutGateVisits';

// filid:contract settle-gate-selection-differential
describe('gate selection verifier histories on full evaluation', () => {
  it.each([
    gateSelectionCases[0],
    gateSelectionCases[1],
    gateSelectionCases[2],
    gateSelectionCases[3],
    gateSelectionCases[4],
    gateSelectionCases[5],
    gateSelectionCases[6],
    gateSelectionCases[7],
    gateSelectionCases[8],
    gateSelectionCases[9],
    gateSelectionCases[10],
    gateSelectionCases[11],
    gateSelectionCases[12],
    gateSelectionCases[13],
  ])('$name', (fixture) => {
    expect(gateSelectionCases).toHaveLength(14);
    const mode = gateSelectionTable.mode;
    const wheel = gateWheelEvaluation.mode;
    gateWheelEvaluation.mode = 'skip';
    const expected = runGateSelectionCase(fixture, () => {
      gateSelectionTable.mode = 'off';
    });
    const shadow = installGateSelectionShadow();
    try {
      for (const selected of ['table', 'verify'] as const) {
        const actual = runGateSelectionCase(fixture, () => {
          gateSelectionTable.mode = selected;
        });
        expect(withoutGateVisits(actual)).toEqual(withoutGateVisits(expected));
      }
      expect(shadow.violations).toEqual([]);
      expect(shadow.count).toBeGreaterThan(0);
    } finally {
      shadow.restore();
      gateSelectionTable.mode = mode;
      gateWheelEvaluation.mode = wheel;
    }
  });
});
