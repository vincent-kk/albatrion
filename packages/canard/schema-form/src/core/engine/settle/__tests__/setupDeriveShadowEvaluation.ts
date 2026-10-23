// Loaded by Vitest setupFiles for verify-unit and verify-render; each file owns its shadow checks.
import { afterAll, expect } from 'vitest';

import { deriveShadowEvaluation } from '../utils/derivation/deriveShadowEvaluation';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';

deriveShadowEvaluation.enabled = true;
gateWheelEvaluation.mode = 'shadow';
gateSelectionTable.mode = 'verify';

/** Exclude assertions from any earlier file sharing this module instance. */
const assertionsBefore = { ...gateSelectionTable.assertions };

afterAll(() => {
  const assertions = Object.fromEntries(
    Object.entries(gateSelectionTable.assertions).map(([key, count]) => [
      key,
      count - (assertionsBefore[key] ?? 0),
    ]),
  );
  if (Object.keys(assertions).length)
    console.log('GATE_TABLE_ASSERTIONS', JSON.stringify(assertions));
  expect(gateWheelEvaluation.nonNoop).toBe(0);
  if (gateWheelEvaluation.predictions || gateWheelEvaluation.missed)
    console.log('gate-wheel-shadow', JSON.stringify(gateWheelEvaluation));
});
