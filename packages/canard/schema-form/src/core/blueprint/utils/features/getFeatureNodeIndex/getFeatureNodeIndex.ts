import type { Blueprint, BlueprintFeatureNodeIndex } from '../../../type';
import { buildFeatureNodeIndex } from './utils/buildFeatureNodeIndex';

/** Static bounds retained only while their immutable blueprint remains reachable. */
const INDICES = new WeakMap<Blueprint, BlueprintFeatureNodeIndex>();

/**
 * Reuse declaration bounds without scanning authored schemas during feature passes.
 * @param blueprint - Finite immutable templates and referring declarations
 * @returns One shared index including inactive declarations and direct child layers
 */
export const getFeatureNodeIndex = (blueprint: Blueprint): BlueprintFeatureNodeIndex => {
  let index = INDICES.get(blueprint);
  if (!index) {
    index = buildFeatureNodeIndex(blueprint);
    INDICES.set(blueprint, index);
  }
  return index;
};
