import type { Blueprint, BlueprintNode } from '../../../blueprint';
import { getFragmentOwnerPaths } from '../../../utils/controls/getFragmentOwnerPaths';
import { getDependencyIndex } from '../dependencies/getDependencyIndex';
import { prepareControlLayers } from './prepareControlLayers';

/**
 * Index child declaration ownership only when a parent has fragment controls.
 * @param node - Immutable child template whose declarations establish ownership
 * @param runtime - Optional tree owner for prepared authored schema syntax
 * @returns Owner paths and the declaration IDs proving each relationship
 */
export const prepareFragmentOwners = (
  node: BlueprintNode,
  runtime?: { readonly blueprint?: Blueprint },
): ReadonlyMap<string, readonly number[]> => {
  const index = prepareControlLayers(node);
  if (index.owners) return index.owners;
  const owners = new Map<string, number[]>();
  for (const declaration of node.declarations)
    for (const path of getFragmentOwnerPaths(
      declaration.schemaPath,
      runtime?.blueprint
        ? getDependencyIndex(runtime.blueprint).pathSegments(
            declaration.schemaPath,
            runtime,
          )
        : undefined,
    )) {
      let ids = owners.get(path);
      if (!ids) owners.set(path, (ids = []));
      ids.push(declaration.id);
    }
  return (index.owners = owners);
};
