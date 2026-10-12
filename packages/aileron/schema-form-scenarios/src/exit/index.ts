import type { FormScenario } from '../types';
import { unsetInactiveScenario } from './unset-inactive.scenario';
import { retainInactiveScenario } from './retain-inactive.scenario';

/** Exit-policy cases for cleared and retained raw values. */
export const exitScenarios: readonly FormScenario[] = [
  unsetInactiveScenario, retainInactiveScenario,
];
