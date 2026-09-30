import type { FormScenario } from '../types';
import { rootOutputScenario } from './root-output.scenario';
import { omitEmptyObjectScenario } from './omit-empty.scenario';

/** Core-observable value projection cases shared with later render runners. */
export const valueScenarios: readonly FormScenario[] = [
  rootOutputScenario, omitEmptyObjectScenario,
];
