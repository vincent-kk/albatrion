import { map as mapArray } from '@winglet/common-utils/array';

import type { Nullable } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import { composeBatchValue } from './composeBatchValue';

/**
 * Read a target's marked input for an updater without publishing it.
 * @param node - Target whose subtree may have pending marks
 * @returns Last committed value with relevant call-order marks overlaid; a virtual target
 * reads its reference fields as a tuple
 */
export const readBatchValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): unknown => {
  const root = node.rootNode;
  const virtual = node.behavior.type === 'virtual' ? node : undefined;
  const names: string[] = [];
  for (
    let cursor: Nullable<Self> = virtual ? node.parent : node;
    cursor && cursor !== root;
    cursor = cursor.parent
  )
    names.unshift(cursor.name);
  let value = composeBatchValue(root, root.runtime.batchWrites ?? []);
  for (const name of names)
    value =
      value !== null && typeof value === 'object'
        ? Reflect.get(value, name)
        : undefined;
  if (!virtual) return value;
  return mapArray(virtual.blueprintNode.fields ?? [], (field) =>
    value !== null && typeof value === 'object'
      ? Reflect.get(value, field)
      : undefined,
  );
};
