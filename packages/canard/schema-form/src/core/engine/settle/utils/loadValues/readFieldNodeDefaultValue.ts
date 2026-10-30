import type { FieldNodeRecord } from '../../../record';
import { getCachedPointerSegments } from '../../../utils/paths/getCachedPointerSegments';
import { getDependencyIndex } from '../dependencies/getDependencyIndex';
import { getLoadValue } from './getLoadValue';

/**
 * Read a node's original load source without observing later caller writes.
 * @param node - Node reference retaining its absolute path
 * @returns The exact source reference at that path in the form snapshot
 */
export const readFieldNodeDefaultValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): unknown =>
  node.detached
    ? node.runtime.detachedReads?.get(node)?.defaultValue
    : getLoadValue(
        node.runtime.loadSnapshot,
        node.path,
        node.runtime.blueprint.capabilities.branchless
          ? getCachedPointerSegments(node.runtime, node.path)
          : getDependencyIndex(node.runtime.blueprint).pathSegments(
              node.path,
              node.runtime,
            ),
      );
