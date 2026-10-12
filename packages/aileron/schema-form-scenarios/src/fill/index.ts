import type { FormScenario } from '../types';
import { mountDefaultScenario } from './mount-default.scenario';
import { appearingDefaultScenario } from './appearing-default.scenario';

/** Default-fill cases spanning mount and gated appearance. */
export const fillScenarios: readonly FormScenario[] = [
  mountDefaultScenario, appearingDefaultScenario,
];
