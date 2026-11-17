import type { FormScenario } from '../../types';
import { handleCommandsScenario } from './handle-commands.scenario';
import { handleRoundTripScenario } from './handle-round-trip.scenario';
import { layoutCompositionScenario } from './layout-composition.scenario';
import { propReplacementScenario } from './prop-replacement.scenario';
import { providerLayersScenario } from './provider-layers.scenario';

export { handleCommandStages } from './handle-commands.scenario';
export type { HandleCommandStage } from './handle-commands.scenario';
export { handleRoundTripIssues } from './handle-round-trip.scenario';
export { layoutPlan } from './layout-composition.scenario';
export { propReplacementStages } from './prop-replacement.scenario';
export type { PropReplacementStage } from './prop-replacement.scenario';
export { providerLayers } from './provider-layers.scenario';

/** Handle and layout feature cases; commands, layouts, providers, and prop replacement run in the consumer. */
export const handleLayoutFeatureScenarios: readonly FormScenario[] = [
  handleRoundTripScenario, handleCommandsScenario, layoutCompositionScenario, providerLayersScenario, propReplacementScenario,
];
