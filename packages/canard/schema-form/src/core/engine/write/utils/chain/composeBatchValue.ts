import { isArray } from '@winglet/common-utils/filter';

import { parsePointerSegments } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { WriteOption } from '../../../types/value';
import { isNamedPointerSegments } from '../../../utils/paths/isNamedPointerSegments';
import { resolveStorageTargets } from '../../../utils/paths/resolveStorageTargets';
import { replaceAtPath } from './utils/replaceAtPath';

/**
 * Overlay marked caller inputs onto the last committed root value. A virtual write is
 * spread over its reference fields in call order, so the composed value never carries a
 * virtual key and a later field write wins over an earlier virtual one (R2).
 * @param root - Common root of every marked occurrence
 * @param writes - Call-order inputs, already resolved from updaters
 * @param base - Committed root value the marks overlay; a reader passes it with a target's own
 * committed value placed at the target address
 * @returns Candidate root input for one settlement
 */
export const composeBatchValue = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  writes: readonly {
    node: Self;
    value: unknown;
    option: WriteOption;
    virtualFields?: readonly string[];
  }[],
  base: unknown = root.storedValue,
): unknown => {
  let value = base;
  for (const write of writes) {
    const names = parsePointerSegments(write.node.path);
    if (!isNamedPointerSegments(names))
      throw new TypeError('Expected a named node path');
    const targets = resolveStorageTargets(write.node);
    if (targets === undefined) {
      value = replaceAtPath(
        value,
        names,
        write.value,
        write.option,
        write.node,
      );
      continue;
    }
    const values = isArray(write.value) ? write.value : undefined;
    const parentNames = names.slice(0, -1);
    for (let index = 0; index < targets.length; index++) {
      const target = targets[index];
      if (
        write.virtualFields
          ? !write.virtualFields.includes(target.name)
          : !target.node && values?.[index] === undefined
      )
        continue;
      value = replaceAtPath(
        value,
        [...parentNames, target.name],
        values?.[index],
        write.option,
        target.node,
      );
    }
  }
  return value;
};
