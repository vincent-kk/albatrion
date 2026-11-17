import type { FormScenario } from '../../types';
import { arrayConstraintsScenario } from './array-constraints.scenario';
import { batchVerbsScenario } from './batch-verbs.scenario';
import { nestedArraysScenario } from './nested-arrays.scenario';
import { objectPropertiesScenario } from './object-properties.scenario';

/** Structure feature cases new to the feature catalog; reused cases stay in their engine families. */
export const structureFeatureScenarios: readonly FormScenario[] = [
  objectPropertiesScenario, nestedArraysScenario, arrayConstraintsScenario, batchVerbsScenario,
];
