import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../../record';
import { WriteOption } from '../../../../types/value';
import { mergeMarkedValue } from './mergeMarkedValue';

/**
 * Replace one marked path while retaining untouched committed references.
 * @param current - Candidate value at this level
 * @param names - Remaining unescaped child names
 * @param incoming - New value for the target
 * @param option - Merge or replacement selection
 * @returns Candidate value with one path overlaid
 */
export const replaceAtPath = <Self extends FieldNodeRecord<Self>>(
  current: unknown,
  names: readonly string[],
  incoming: unknown,
  option: WriteOption,
  node?: Self,
): unknown => {
  if (!names.length)
    return option & WriteOption.Merge && !(option & WriteOption.Replace)
      ? mergeMarkedValue(node, current, incoming)
      : incoming;
  const [name, ...rest] = names;
  if (isArray(current)) {
    const next = [...current];
    next[Number(name)] = replaceAtPath(
      next[Number(name)],
      rest,
      incoming,
      option,
      node,
    );
    return next;
  }
  const next =
    current !== null && typeof current === 'object' ? { ...current } : {};
  return {
    ...next,
    [name]: replaceAtPath(
      Reflect.get(next, name),
      rest,
      incoming,
      option,
      node,
    ),
  };
};
