import type { FormScenario } from '../../types';
import { defaultLayersScenario } from './default-layers.scenario';
import { restrictedInputFindingScenario } from './finding-restricted-input.scenario';
import { literalAndFormatScenario } from './literal-and-format.scenario';
import { primitiveInputsScenario } from './primitive-inputs.scenario';
import { recursiveTreeScenario } from './recursive-tree.scenario';

/** Value feature cases new to the feature catalog; reused cases stay in their engine families. */
export const valuesFeatureScenarios: readonly FormScenario[] = [
  primitiveInputsScenario, literalAndFormatScenario, defaultLayersScenario, recursiveTreeScenario,
];

/** Value open questions: expectations state what the screen would need to show and fail against the current inputs. */
export const valuesFindingScenarios: readonly FormScenario[] = [restrictedInputFindingScenario];
