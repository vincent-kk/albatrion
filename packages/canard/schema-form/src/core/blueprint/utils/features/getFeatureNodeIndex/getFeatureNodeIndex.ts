import type { Blueprint, BlueprintFeatureNodeIndex } from '../../../type';
import { emptyReadonlyMap } from '../../../../utils/emptyReadonlyMap';
import { emptyReadonlySet } from '../../../../utils/emptyReadonlySet';
import { buildFeatureNodeIndex } from './utils/buildFeatureNodeIndex';

/** Static bounds retained only while their immutable blueprint remains reachable. */
const INDICES = new WeakMap<Blueprint, BlueprintFeatureNodeIndex>();
/** No mutable memberships are published for independently proven absent features. */
const EMPTY_INDEX: BlueprintFeatureNodeIndex = Object.freeze({
  stateKeyNodes: emptyReadonlySet, stateKeyChildren: emptyReadonlyMap,
  watchNodes: emptyReadonlySet,
});

/**
 * Reuse declaration bounds without scanning authored schemas during feature passes.
 * @param blueprint - Finite immutable templates and referring declarations
 * @returns One shared index including inactive declarations and direct child layers
 */
export const getFeatureNodeIndex = (blueprint: Blueprint): BlueprintFeatureNodeIndex => {
  if (!blueprint.capabilities.hasState && !blueprint.capabilities.hasWatch) return EMPTY_INDEX;
  let index = INDICES.get(blueprint);
  if (!index) {
    index = buildFeatureNodeIndex(blueprint);
    INDICES.set(blueprint, index);
  }
  return index;
};
