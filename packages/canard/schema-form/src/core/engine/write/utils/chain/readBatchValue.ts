import { map as mapArray } from '@winglet/common-utils/array';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Nullable } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import { resolveStorageTargets } from '../../../utils/paths/resolveStorageTargets';
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
  const targets = resolveStorageTargets(node);
  const names: string[] = [];
  for (
    let cursor: Nullable<Self> = targets ? node.parent : node;
    cursor && cursor !== root;
    cursor = cursor.parent
  )
    names.unshift(cursor.name);
  let value = composeBatchValue(root, root.runtime.batchWrites ?? []);
  for (const name of names)
    value =
      value !== null && typeof value === 'object' && hasOwnProperty(value, name)
        ? Reflect.get(value, name)
        : undefined;
  if (!targets) return value;
  return mapArray(targets, (target) =>
    value !== null &&
    typeof value === 'object' &&
    hasOwnProperty(value, target.name)
      ? Reflect.get(value, target.name)
      : undefined,
  );
};
