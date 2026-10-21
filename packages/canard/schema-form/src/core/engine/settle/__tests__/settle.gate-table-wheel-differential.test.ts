import { describe, expect, it } from 'vitest';

import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { gateWheelCases } from './fixtures/gateWheelCases';
import { runGateSelectionCase } from './helpers/runGateSelectionCase';
import { withoutGateVisits } from './helpers/withoutGateVisits';

// filid:contract settle-gate-table-wheel
describe('gate wheel histories through the internal setup hook', () => {
  it.each([
    gateWheelCases[0],
    gateWheelCases[1],
    gateWheelCases[2],
    gateWheelCases[3],
    gateWheelCases[4],
    gateWheelCases[5],
    gateWheelCases[6],
    gateWheelCases[7],
    gateWheelCases[8],
    gateWheelCases[9],
    gateWheelCases[10],
    gateWheelCases[11],
    gateWheelCases[12],
    gateWheelCases[13],
    gateWheelCases[14],
  ])('$name', (fixture) => {
    expect(gateWheelCases).toHaveLength(15);
    const mode = gateSelectionTable.mode;
    const wheel = gateWheelEvaluation.mode;
    gateWheelEvaluation.mode = 'skip';
    try {
      const baseline = runGateSelectionCase(fixture, () => {
        gateSelectionTable.mode = 'off';
      });
      for (const selected of ['table', 'verify'] as const) {
        const actual = runGateSelectionCase(fixture, () => {
          gateSelectionTable.mode = selected;
        });
        expect(withoutGateVisits(actual)).toEqual(withoutGateVisits(baseline));
      }
    } finally {
      gateSelectionTable.mode = mode;
      gateWheelEvaluation.mode = wheel;
    }
  });
});
