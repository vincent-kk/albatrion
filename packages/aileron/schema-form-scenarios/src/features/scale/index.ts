import type { FormScenario } from '../../types';
import { deferredMountScenario } from './deferred-mount.scenario';
import { expressionCostScenario } from './expression-cost.scenario';
import { largeArrayScenario } from './large-array.scenario';

export { deferredMountOptions, deferredMountStages } from './deferred-mount.scenario';
export type { DeferredMountStage } from './deferred-mount.scenario';
export { largeArrayTyped } from './large-array.scenario';

/** Scale and virtualization feature cases; reveals by view and focus run in the consumer. */
export const scaleFeatureScenarios: readonly FormScenario[] = [
  deferredMountScenario, largeArrayScenario, expressionCostScenario,
];
