import type { SchemaNodeRecord } from '../../../record';

/**
 * Check a binding-supplied replacement before following its runtime.
 * @param value - Replacement supplied by chain adoption
 * @returns Whether the candidate exposes the record's root runtime
 */
const isSchemaNodeChainRoot = <Self extends SchemaNodeRecord<Self>>(
  value: unknown,
): value is Self => value !== null && typeof value === 'object' &&
  'runtime' in value && 'rootNode' in value;

/**
 * Follow a rebuilt root to the current owner of an open entry.
 * @param root - Root on which the public call began
 * @returns Most recent replacement root, or the original when unchanged
 */
export const resolveSchemaNodeChainRoot = <Self extends SchemaNodeRecord<Self>>(
  root: Self,
): Self => {
  let active = root;
  while (isSchemaNodeChainRoot<Self>(active.runtime.adoptedRoot))
    active = active.runtime.adoptedRoot;
  return active;
};
