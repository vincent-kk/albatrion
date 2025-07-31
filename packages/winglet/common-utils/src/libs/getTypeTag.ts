import { NULL_TAG, UNDEFINED_TAG } from '@/common-utils/constant/typeTag';

/**
 * Retrieves the internal [[Class]] type tag for precise type identification.
 *
 * Uses Object.prototype.toString to get the native type tag, providing more
 * accurate type detection than typeof for built-in objects, handling edge cases
 * like null and undefined with optimized performance.
 *
 * @template Type - Type of the input value
 * @param value - Value to analyze for type tag
 * @returns Native type tag string (e.g., '[object Array]', '[object Date]')
 *
 * @example
 * Built-in type detection:
 * ```typescript
 * import { getTypeTag } from '@winglet/common-utils';
 *
 * console.log(getTypeTag([])); // '[object Array]'
 * console.log(getTypeTag({})); // '[object Object]'
 * console.log(getTypeTag(new Date())); // '[object Date]'
 * console.log(getTypeTag(/regex/)); // '[object RegExp]'
 * console.log(getTypeTag(null)); // '[object Null]'
 * console.log(getTypeTag(undefined)); // '[object Undefined]'
 * ```
 *
 * @remarks
 * More reliable than typeof for object type detection. Handles null/undefined
 * edge cases efficiently without Object.prototype.toString overhead.
 */
export const getTypeTag = <Type>(value: Type): string => {
  if (value === null) return NULL_TAG;
  if (value === undefined) return UNDEFINED_TAG;
  return Object.prototype.toString.call(value);
};
