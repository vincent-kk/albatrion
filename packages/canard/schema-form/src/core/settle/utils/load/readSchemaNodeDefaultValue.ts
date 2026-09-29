import type { SchemaNodeRecord } from '../../../record';
import { getLoadValue } from './getLoadValue';

/**
 * Read a node's original load source without observing later caller writes.
 * @param node - Live node retaining its absolute path
 * @returns The exact source reference at that path in the form snapshot
 */
export const readSchemaNodeDefaultValue = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): unknown => getLoadValue(node.runtime.loadSnapshot, node.path);
