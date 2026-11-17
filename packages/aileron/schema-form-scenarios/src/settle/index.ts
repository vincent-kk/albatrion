import type { FormScenario } from '../types';
export { conditionalScreenScenarios } from './conditional-screen.scenario';
import { gatedShapeScenario } from './gated-shape.scenario';
import { formResetScenario } from './form-reset.scenario';

/** Synchronous settlement and load-lifetime cases. */
export const settleScenarios: readonly FormScenario[] = [
  gatedShapeScenario, formResetScenario,
];
