import type { FieldNodeRecord } from '../../../record';

/**
 * Check a binding-supplied replacement before following its runtime.
 * @param value - Replacement supplied by chain adoption
 * @returns Whether the candidate exposes the record's root runtime
 */
const isFieldNodeChainRoot = <Self extends FieldNodeRecord<Self>>(
  value: unknown,
): value is Self =>
  value !== null &&
  typeof value === 'object' &&
  'runtime' in value &&
  'rootNode' in value;

/**
 * Follow a rebuilt root to the current owner of an open entry.
 * @param root - Root on which the public call began
 * @param passed - Optional set that receives every runtime on the way, `root`'s and the result's included
 * @returns Most recent replacement root, or the original when unchanged
 */
export const resolveFieldNodeChainRoot = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  passed?: Set<Self['runtime']>,
): Self => {
  let active = root;
  passed?.add(active.runtime);
  while (isFieldNodeChainRoot<Self>(active.runtime.adoptedRoot)) {
    active = active.runtime.adoptedRoot;
    passed?.add(active.runtime);
  }
  return active;
};
