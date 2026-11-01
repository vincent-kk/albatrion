import { getBlueprintDerived } from '../../../utils/cache/derivedRecords';
import { emptyReadonlyMap } from '../../../utils/emptyReadonlyMap';
import { emptyReadonlySet } from '../../../utils/emptyReadonlySet';
import type {
  Blueprint,
  BlueprintFeatureNodeIndex,
} from '../../types/blueprint';
import { buildFeatureNodeIndex } from './buildFeatureNodeIndex';

/** Static bounds retained only while their immutable blueprint remains reachable. */

/** No mutable memberships are published for independently proven absent features. */
const EMPTY_INDEX: BlueprintFeatureNodeIndex = Object.freeze({
  stateKeyNodes: emptyReadonlySet,
  stateKeyChildren: emptyReadonlyMap,
  watchNodes: emptyReadonlySet,
});

/**
 * Reuse declaration bounds without scanning authored schemas during feature passes.
 * @param blueprint - Finite immutable templates and referring declarations
 * @returns One shared index including inactive declarations and direct child layers
 */
export const getFeatureNodeIndex = (
  blueprint: Blueprint,
): BlueprintFeatureNodeIndex => {
  if (!blueprint.capabilities.hasState && !blueprint.capabilities.hasWatch)
    return EMPTY_INDEX;
  let index = getBlueprintDerived<
    'featureNodeIndex',
    BlueprintFeatureNodeIndex
  >(blueprint).featureNodeIndex;
  if (!index) {
    index = buildFeatureNodeIndex(blueprint);
    getBlueprintDerived<'featureNodeIndex', BlueprintFeatureNodeIndex>(
      blueprint,
    ).featureNodeIndex = index;
  }
  return index;
};
