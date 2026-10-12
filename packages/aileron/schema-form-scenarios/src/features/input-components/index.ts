import type { FormScenario } from '../../types';
import { childComponentsScenario } from './child-components.scenario';
import { fileAttachScenario } from './file-attach.scenario';
import { inputMapScenario } from './input-map.scenario';
import { inputResolutionScenario } from './input-resolution.scenario';
import { propsFlowScenario } from './props-flow.scenario';
import { trimOnBlurScenario } from './trim-on-blur.scenario';

export { childComponentStages, mapEntryStages } from './child-components.scenario';
export type { ChildComponentStage, MapEntryStage } from './child-components.scenario';
export { fileAttachStages } from './file-attach.scenario';
export type { FileAttachStage } from './file-attach.scenario';
export { inputMapCase } from './input-map.scenario';
export { inputResolutionCases, inputResolutionPluginDefinition } from './input-resolution.scenario';
export type { InputResolutionCase } from './input-resolution.scenario';
export { propsFlowAttributes } from './props-flow.scenario';
export { trimStages } from './trim-on-blur.scenario';
export type { TrimStage } from './trim-on-blur.scenario';
export type { InputWinner, LabeledDefinition } from './types';

/** Input component feature cases; components, definitions, and File objects are built by each consumer from labels. */
export const inputComponentsFeatureScenarios: readonly FormScenario[] = [
  inputResolutionScenario, inputMapScenario, trimOnBlurScenario, fileAttachScenario, propsFlowScenario, childComponentsScenario,
];
