import type { FormScenario } from '../types';
import { orderScenario } from './order.scenario';
import { batchScenario } from './batch.scenario';
import { warningScenario } from './warning.scenario';

/** Pure notification cases reused by core, render, and story runners. */
export const notifyScenarios: readonly FormScenario[] = [
  orderScenario, batchScenario, warningScenario,
];
