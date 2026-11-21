import type { FieldNodeRecord } from '../../../record';
import { getCachedPointerSegments } from '../../../utils/paths/getCachedPointerSegments';
import { getDependencyIndex } from '../dependencies/getDependencyIndex';

/**
 * Read the cached syntax of a node's ordinary physical address.
 * @param node - Live occurrence; the caller handles virtual and detached reads.
 * @returns Segments from the runtime or dependency cache chosen for the blueprint.
 */
export const readLoadSegments = <Self extends FieldNodeRecord<Self>>(node: Self) =>
  node.runtime.blueprint.capabilities.isBranchless
    ? getCachedPointerSegments(node.runtime, node.path)
    : getDependencyIndex(node.runtime.blueprint).pathSegments(node.path, node.runtime);
