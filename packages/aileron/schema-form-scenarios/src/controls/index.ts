import type { FormScenario } from '../types';
import { stateScenarios } from './states.scenario';
import { scopeScenarios } from './scope.scenario';
import { exitLayerScenarios } from './exit-layers.scenario';

/** Local state combinations, declaration scope, and exit-policy layers. */
export const controlsScenarios: readonly FormScenario[] = [
  ...stateScenarios, ...scopeScenarios, ...exitLayerScenarios,
];
