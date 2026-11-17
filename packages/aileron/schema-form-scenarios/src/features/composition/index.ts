import type { FormScenario } from '../../types';
import { allOfScenarios } from './all-of.scenario';
import { discriminatorScenario } from './discriminator.scenario';
import { batchRetentionScenarios } from './batch-retention.scenario';
import { ifThenElseScenarios } from './if-then-else.scenario';
import { nestedThreeLevelsScenario } from './nested-three-levels.scenario';
import { oneOfAnyOfScenario } from './oneof-anyof.scenario';
import { validatorBranchScenarios } from './validator-branch.scenario';

/** Composition feature cases new to the feature catalog; reused cases stay in their engine families. */
export const compositionFeatureScenarios: readonly FormScenario[] = [
  discriminatorScenario, nestedThreeLevelsScenario, oneOfAnyOfScenario,
  ...allOfScenarios, ...ifThenElseScenarios, ...validatorBranchScenarios, ...batchRetentionScenarios,
];
