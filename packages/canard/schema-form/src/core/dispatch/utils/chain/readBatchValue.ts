import type { SchemaNodeRecord } from '../../../record';
import { composeBatchValue } from './composeBatchValue';

/**
 * Read a target's marked input for an updater without publishing it.
 * @param node - Target whose subtree may have pending marks
 * @returns Last committed value with relevant call-order marks overlaid
 */
export const readBatchValue = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): unknown => {
  const root = node.rootNode;
  const names: string[] = [];
  for (let cursor: Self | null = node; cursor && cursor !== root; cursor = cursor.parent)
    names.unshift(cursor.name);
  let value = composeBatchValue(root, root.runtime.batchWrites ?? []);
  for (const name of names)
    value = value !== null && typeof value === 'object' ? Reflect.get(value, name) : undefined;
  return value;
};
