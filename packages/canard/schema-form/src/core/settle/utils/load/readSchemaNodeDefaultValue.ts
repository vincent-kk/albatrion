import type { SchemaNodeRecord } from '../../../record';
import { getLoadValue } from './getLoadValue';

/**
 * Read a node's original load source without observing later caller writes.
 * @param node - Node reference retaining its absolute path
 * @returns The exact source reference at that path in the form snapshot
 */
export const readSchemaNodeDefaultValue = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): unknown => node.detached
  ? node.runtime.detachedReads?.get(node)?.defaultValue
  : getLoadValue(node.runtime.loadSnapshot, node.path);
