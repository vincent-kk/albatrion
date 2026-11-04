import type { FormScenario } from '../../types';
import { errorIsolationScenario } from './error-isolation.scenario';
import { rendererReplacementScenario } from './renderer-replacement.scenario';
import { validatorSourcesScenario } from './validator-sources.scenario';

export { isolationTrigger } from './error-isolation.scenario';
export { rendererCases } from './renderer-replacement.scenario';
export type { RendererCase, RendererSlot } from './renderer-replacement.scenario';
export { validatorSourceCases } from './validator-sources.scenario';
export type { ValidatorSourceCase } from './validator-sources.scenario';

/** Plugin and isolation feature cases; validator sources, renderers, and throwing inputs come from the consumer. */
export const pluginsFeatureScenarios: readonly FormScenario[] = [
  validatorSourcesScenario, rendererReplacementScenario, errorIsolationScenario,
];
