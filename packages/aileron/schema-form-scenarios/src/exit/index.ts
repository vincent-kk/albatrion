import type { FormScenario } from '../types';
export { branchExitScenario } from './branch-screen.scenario';
export { presenceReadersScenario } from './presence-readers.scenario';
import { unsetInactiveScenario } from './unset-inactive.scenario';
import { retainInactiveScenario } from './retain-inactive.scenario';

/** Exit-policy cases for cleared and retained raw values. */
export const exitScenarios: readonly FormScenario[] = [
  unsetInactiveScenario, retainInactiveScenario,
];
