import { isPlainObject } from '@/common-utils/utils/filter';

import { getDataProperty } from '../../getDataProperty';
import { setDataProperty } from '../../setDataProperty';
import type { MergeOptions } from '../type';

/**
 * Merge containers under explicit mutation and reference policies.
 * @param target - Earlier object or array; mutated unless immutable is selected
 * @param source - Later object or array, never mutated
 * @param options - Policies propagated through all nested containers
 * @returns The target or a shallow target copy containing recursively merged values
 */
export const mergeWithOptions = <
  Target extends Record<PropertyKey, any>,
  Source extends Record<PropertyKey, any>,
>(
  target: Target,
  source: Source,
  options: MergeOptions,
): Target & Source => {
  if (options.isAtomic?.(source) || options.isAtomic?.(target))
    return source as unknown as Target & Source;
  if (Array.isArray(source) && options.arrayStrategy === 'replace')
    return source as unknown as Target & Source;
  const result: Record<PropertyKey, any> = options.immutable
    ? Array.isArray(target)
      ? target.slice()
      : { ...target }
    : target;
  for (const key of Object.keys(source)) {
    const sourceValue = getDataProperty(source, key);
    const targetValue = getDataProperty(target, key);
    if (sourceValue === undefined && targetValue !== undefined) continue;
    let value = sourceValue;
    if (!options.isAtomic?.(sourceValue) && !options.isAtomic?.(targetValue)) {
      if (Array.isArray(sourceValue)) {
        if (options.arrayStrategy !== 'replace')
          value = Array.isArray(targetValue)
            ? mergeWithOptions(targetValue, sourceValue, options)
            : options.preserveReferences
              ? sourceValue
              : mergeWithOptions([], sourceValue, options);
      } else if (isPlainObject(sourceValue))
        value = isPlainObject(targetValue)
          ? mergeWithOptions(targetValue, sourceValue, options)
          : options.preserveReferences
            ? sourceValue
            : mergeWithOptions({}, sourceValue, options);
    }
    setDataProperty(result, key, value);
  }
  return result as Target & Source;
};
