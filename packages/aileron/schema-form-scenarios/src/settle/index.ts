import type { FormScenario } from '../types';
import { gatedShapeScenario } from './gated-shape.scenario';
import { formResetScenario } from './form-reset.scenario';

/** Synchronous settlement and load-lifetime cases. */
export const settleScenarios: readonly FormScenario[] = [
  gatedShapeScenario, formResetScenario,
];
