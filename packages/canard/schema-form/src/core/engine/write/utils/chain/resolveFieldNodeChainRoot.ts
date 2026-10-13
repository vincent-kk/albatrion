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
 * @returns Most recent replacement root, or the original when unchanged
 */
export const resolveFieldNodeChainRoot = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): Self => {
  let active = root;
  while (isFieldNodeChainRoot<Self>(active.runtime.adoptedRoot))
    active = active.runtime.adoptedRoot;
  return active;
};
