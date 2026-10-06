import { isPlainObject } from '@winglet/common-utils/filter';
import { getDataProperty } from '@winglet/common-utils/object';

/**
 * Protect nested plain objects created by one completed immutable hint merge.
 * @param result - Merge-owned root; the caller protects its envelope separately.
 * @param earlier - Earlier input whose identical child references remain borrowed.
 * @param later - Later input whose identical child references remain borrowed.
 * @returns Nothing; visits only newly merged plain objects and never opaque inputs.
 */
export const freezeCreatedHintObjects = (
  result: Record<string, unknown>,
  earlier: Record<string, unknown>,
  later: Record<string, unknown>,
): void => {
  const keys = Object.keys(result);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    const value = result[key];
    const previous = getDataProperty(earlier, key);
    const next = getDataProperty(later, key);
    if (value === previous || value === next || !isPlainObject(value)) continue;
    freezeCreatedHintObjects(
      value,
      previous as Record<string, unknown>,
      next as Record<string, unknown>,
    );
    Object.freeze(value);
  }
};
