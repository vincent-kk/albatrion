import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  isDescendantPath,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import { WriteOption } from '../../../../types/value';

/** One batch mark reduced to what decides whether a later mark replaces it. */
type MarkAddress = {
  readonly paths: readonly string[];
  readonly option: WriteOption;
  readonly value: unknown;
};

/** Whether a Merge `value` at `from` names the address `to` below it, or replaces a step on the way. */
const namesAddress = (value: unknown, from: string, to: string): boolean => {
  let current = value;
  for (const name of parsePointerSegments(to.slice(from.length))) {
    if (current === null || typeof current !== 'object') return true;
    if (typeof name !== 'string' || !hasOwnProperty(current, name))
      return false;
    current = Reflect.get(current, name);
  }
  return true;
};

/**
 * Tell whether a later mark of the same segment replaces every storage address of an earlier one,
 * as the later call of the same two calls in sequence would (write DETAIL EVENT-013).
 * @param earlier - Storage paths, option and value of the earlier mark
 * @param later - Storage paths, option and value of the later mark
 * @returns Whether each earlier address is equal to or below a later address the later mark writes
 */
export const isMarkOverridden = (
  earlier: MarkAddress,
  later: MarkAddress,
): boolean => {
  const isMerge =
    (later.option & WriteOption.Merge) === WriteOption.Merge &&
    !(later.option & WriteOption.Replace);
  return earlier.paths.every((path) =>
    later.paths.some(
      (scope) =>
        path === scope ||
        (isDescendantPath(path, scope) &&
          (!isMerge || namesAddress(later.value, scope, path))),
    ),
  );
};
