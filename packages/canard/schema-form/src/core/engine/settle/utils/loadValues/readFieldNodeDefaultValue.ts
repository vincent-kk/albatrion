import type { FieldNodeRecord } from '../../../record';
import { getLoadValue } from './getLoadValue';
import { readLoadSegments } from './readLoadSegments';
import { readVirtualDefaultValue } from './readVirtualDefaultValue';

/**
 * Read a node's original load source without observing later caller writes.
 * @param node - Node reference retaining its absolute path
 * @returns The source at that storage path, or the constituent source tuple for a virtual group,
 * which keeps its reference while every constituent source is unchanged
 */
export const readFieldNodeDefaultValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): unknown => {
  if (node.isDetached)
    return node.runtime.detachedReads?.get(node)?.defaultValue;
  if (node.behavior.type === 'virtual') return readVirtualDefaultValue(node);
  return getLoadValue(
    node.runtime.loadSnapshot,
    node.path,
    readLoadSegments(node),
  );
};
