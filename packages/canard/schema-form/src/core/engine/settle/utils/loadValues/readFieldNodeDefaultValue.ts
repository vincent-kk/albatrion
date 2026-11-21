import type { FieldNodeRecord } from '../../../record';
import { getCachedPointerSegments } from '../../../utils/paths/getCachedPointerSegments';
import { getDependencyIndex } from '../dependencies/getDependencyIndex';
import { getLoadValue } from './getLoadValue';
import { readLoadProperty } from './readLoadProperty';

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
  if (node.behavior.type === 'virtual') {
    if (!node.parent) return [];
    const host = getLoadValue(node.runtime.loadSnapshot, node.parent.path);
    return (node.blueprintNode.fields ?? []).map((name) =>
      readLoadProperty(host, name),
    );
  }
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
