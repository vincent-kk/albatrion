import type { FieldNodeRecord } from '../../../record';
import { getCachedPointerSegments } from '../../../utils/paths/getCachedPointerSegments';
import { resolveStorageTargets } from '../../../utils/paths/resolveStorageTargets';
import { getDependencyIndex } from '../dependencies/getDependencyIndex';
import { getLoadValue } from './getLoadValue';

/**
 * Read a node's original load source without observing later caller writes.
 * @param node - Node reference retaining its absolute path
 * @returns The source at that storage path, or the constituent source tuple for a virtual group
 */
export const readFieldNodeDefaultValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): unknown => {
  if (node.isDetached)
    return node.runtime.detachedReads?.get(node)?.defaultValue;
  if (node.behavior.type === 'virtual')
    return resolveStorageTargets(node)?.map((target) =>
      getLoadValue(node.runtime.loadSnapshot, target.path),
    );
  return getLoadValue(
    node.runtime.loadSnapshot,
    node.path,
    node.runtime.blueprint.capabilities.isBranchless
      ? getCachedPointerSegments(node.runtime, node.path)
      : getDependencyIndex(node.runtime.blueprint).pathSegments(
          node.path,
          node.runtime,
        ),
  );
};
