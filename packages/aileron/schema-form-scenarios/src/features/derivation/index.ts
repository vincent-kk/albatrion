import type { FormScenario } from '../../types';
import { contextReferenceScenario } from './context-reference.scenario';
import { resetInteractionScenario } from './reset-interaction.scenario';
import { visibleVersusActiveScenario } from './visible-versus-active.scenario';
import { watchDependencyScenario } from './watch-dependency.scenario';

export { contextStages } from './context-reference.scenario';
export type { ContextStage } from './context-reference.scenario';
export { resetInteractionStages } from './reset-interaction.scenario';
export type { ResetInteractionStage } from './reset-interaction.scenario';

/** Derivation feature cases new to the catalog; controls, exit, and derive families supply the rest by import. */
export const derivationFeatureScenarios: readonly FormScenario[] = [
  visibleVersusActiveScenario, watchDependencyScenario, resetInteractionScenario, contextReferenceScenario,
];
