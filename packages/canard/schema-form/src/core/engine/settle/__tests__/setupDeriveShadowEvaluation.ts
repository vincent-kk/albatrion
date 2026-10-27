// Loaded by Vitest setupFiles for verify-unit and verify-render; each file owns its shadow checks.
import { afterAll, expect } from 'vitest';

import { engineModes } from '../../utils/cache/engineModes';
import { inactiveValuesVerification } from '../utils/commit/verifyInactiveValuesMemo';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';

const previousModes = {
  gateSelection: engineModes.gateSelection,
  gateWheel: engineModes.gateWheel,
  deriveShadow: engineModes.deriveShadow,
  inactiveValues: engineModes.inactiveValues,
};
engineModes.setMode('inactiveValues', 'verify');
engineModes.setMode('deriveShadow', true);
engineModes.setMode('gateWheel', 'shadow');
engineModes.setMode('gateSelection', 'verify');

/** Exclude assertions from any earlier file sharing this module instance. */
const assertionsBefore = { ...gateSelectionTable.assertions };

afterAll(() => {
  try {
    const assertions = Object.fromEntries(
      Object.entries(gateSelectionTable.assertions).map(([key, count]) => [
        key,
        count - (assertionsBefore[key] ?? 0),
      ]),
    );
    if (Object.keys(assertions).length)
      console.log('GATE_TABLE_ASSERTIONS', JSON.stringify(assertions));
    if (
      inactiveValuesVerification.comparisons ||
      inactiveValuesVerification.reads
    )
      console.log(
        'INACTIVE_VALUES_SHADOW',
        JSON.stringify(inactiveValuesVerification),
      );
    expect(inactiveValuesVerification.violations).toBe(0);
    expect(gateWheelEvaluation.nonNoop).toBe(0);
    if (gateWheelEvaluation.predictions || gateWheelEvaluation.missed)
      console.log('gate-wheel-shadow', JSON.stringify(gateWheelEvaluation));
  } finally {
    engineModes.setMode('gateSelection', previousModes.gateSelection);
    engineModes.setMode('gateWheel', previousModes.gateWheel);
    engineModes.setMode('deriveShadow', previousModes.deriveShadow);
    engineModes.setMode('inactiveValues', previousModes.inactiveValues);
  }
});
