// Loaded by Vitest setupFiles for unit, render and react18; each worker owns its switch.
import { afterAll, expect } from 'vitest';

import { deriveShadowEvaluation } from '../utils/derivation/deriveShadowEvaluation';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';

deriveShadowEvaluation.enabled = true;
gateWheelEvaluation.mode = 'shadow';

afterAll(() => {
  expect(gateWheelEvaluation.nonNoop).toBe(0);
  if (gateWheelEvaluation.predictions || gateWheelEvaluation.missed)
    console.log('gate-wheel-shadow', JSON.stringify(gateWheelEvaluation));
});
