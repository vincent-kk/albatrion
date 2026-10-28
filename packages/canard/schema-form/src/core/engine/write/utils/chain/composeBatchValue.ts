import { isArray } from '@winglet/common-utils/filter';

import { parsePointer } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { WriteOption } from '../../../types/value';
import { replaceAtPath } from './utils/replaceAtPath';

/**
 * Overlay marked caller inputs onto the last committed root value. A virtual write is
 * spread over its reference fields in call order, so the composed value never carries a
 * virtual key and a later field write wins over an earlier virtual one (R2).
 * @param root - Common root of every marked occurrence
 * @param writes - Call-order inputs, already resolved from updaters
 * @returns Candidate root input for one settlement
 */
export const composeBatchValue = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  writes: readonly { node: Self; value: unknown; option: WriteOption }[],
): unknown => {
  let value = root.local;
  for (const write of writes) {
    const names = parsePointer(write.node.path).segments;
    if (
      !names.every((segment): segment is string => typeof segment === 'string')
    )
      throw new TypeError('Expected a named node path');
    const fields =
      write.node.behavior.type === 'virtual'
        ? (write.node.blueprintNode.fields ?? [])
        : undefined;
    if (fields === undefined) {
      value = replaceAtPath(value, names, write.value, write.option);
      continue;
    }
    const values = isArray(write.value) ? write.value : undefined;
    const parentNames = names.slice(0, -1);
    for (let index = 0; index < fields.length; index++) {
      if (!write.node.parent?.structure?.[fields[index]]) continue;
      value = replaceAtPath(
        value,
        [...parentNames, fields[index]],
        values?.[index],
        write.option,
      );
    }
  }
  return value;
};
