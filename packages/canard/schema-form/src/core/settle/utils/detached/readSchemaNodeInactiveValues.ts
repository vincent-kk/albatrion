import type { SchemaNodeRecord } from '../../../record';

import { EMPTY_VALUES } from './emptyDetachedReads';

/** Read the current or final committed inactive values for one reference. */
export const readSchemaNodeInactiveValues = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): readonly { path: string; value: unknown }[] => node.detached
  ? node.runtime.detachedReads?.get(node)?.inactiveValues ?? EMPTY_VALUES
  : node.runtime.inactiveValuesMemo.get(node.path) ?? EMPTY_VALUES;
