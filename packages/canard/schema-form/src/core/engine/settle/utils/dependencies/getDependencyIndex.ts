import type { Blueprint, BlueprintNode } from '../../../blueprint';
import { getBlueprintDerived } from '../../../utils/cache/derivedRecords';
import { DependencyIndex, type RegistrationTable } from './trie/DependencyIndex';

/** Cached dependency indexes live only while their analyzed blueprint lives. */

/** Dependency absence is proven independently of branch presence. */
const EMPTY_INDEX = new DependencyIndex();
Object.freeze(EMPTY_INDEX);

/**
 * Reuse a path index for all writes against one analyzed blueprint.
 * @param blueprint - Static dependency dictionary and declaration IDs
 * @param tables - Optional compute-owned static evidence for split registration
 * @returns Reverse dependency trie for ancestor and descendant invalidation
 */
export const getDependencyIndex = (
  blueprint: Blueprint,
  tables?: ReadonlyMap<BlueprintNode, RegistrationTable>,
): DependencyIndex => {
  if (
    !blueprint.capabilities.hasDependencies &&
    !blueprint.capabilities.hasExpressions
  )
    return EMPTY_INDEX;
  let index = getBlueprintDerived<'dependencyIndex', DependencyIndex>(
    blueprint,
  ).dependencyIndex;
  if (!index) {
    index = new DependencyIndex(blueprint);
    getBlueprintDerived<'dependencyIndex', DependencyIndex>(
      blueprint,
    ).dependencyIndex = index;
  }
  if (tables) index.prepareRegistration(tables);
  return index;
};
