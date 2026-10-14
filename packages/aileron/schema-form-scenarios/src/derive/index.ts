import type { FormScenario } from '../types';
import { deriveRenderScenarios } from './render.scenario';
import { edgeScenarios } from './edges.scenario';
import { injectionScenarios } from './injection.scenario';
import { budgetScenario } from './budget.scenario';

/** Derive edges, injection loads, and bounded feedback on the core tree. */
export const deriveScenarios: readonly FormScenario[] = [
  ...edgeScenarios, ...injectionScenarios, budgetScenario,
  ...deriveRenderScenarios,
];
