import type { SchemaNodeRecord } from '../../../record';

/** Read the current or final committed mismatch lamp for one reference. */
export const readSchemaNodeTypeMismatch = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): boolean => node.detached
  ? node.runtime.detachedReads?.get(node)?.typeMismatch ?? false
  : node.runtime.typeMismatchPaths.has(node.path);
