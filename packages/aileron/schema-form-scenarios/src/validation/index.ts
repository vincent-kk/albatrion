import type { FormScenario } from '../types';
import { ifOnlyScenario } from './if-only.scenario';
import { unionTypeScenario } from './union-type.scenario';

/** Pure authored-schema validation cases. */
export const validationScenarios: readonly FormScenario[] = [
  ifOnlyScenario, unionTypeScenario,
];
