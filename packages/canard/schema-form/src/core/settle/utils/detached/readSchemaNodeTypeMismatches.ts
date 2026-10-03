import type { SchemaNodeRecord } from '../../../record';

import { EMPTY_PATHS } from './emptyDetachedReads';

/** Read the current or final committed mismatch paths for one reference. */
export const readSchemaNodeTypeMismatches = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): readonly string[] => node.detached
  ? node.runtime.detachedReads?.get(node)?.typeMismatches ?? EMPTY_PATHS
  : node.runtime.typeMismatchesMemo?.get(node.path)?.paths ?? EMPTY_PATHS;
