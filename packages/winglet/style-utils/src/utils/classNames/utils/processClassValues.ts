/**
 * Processes class values into a combined string with duplicate handling.
 *
 * Core processing function that recursively handles all ClassValue types
 * and optionally removes duplicates while maintaining order. Uses optimized
 * algorithms for small datasets (< 100 classes) commonly found in web development.
 *
 * @param args - Array of class values to process
 * @param removeDuplicates - Whether to remove duplicate class names
 * @returns Combined class names as a string
 *
 * @example
 * ```typescript
 * // Basic processing
 * processClassValues(['btn', 'primary'], true); // → 'btn primary'
 *
 * // With duplicates
 * processClassValues(['btn', 'btn', 'primary'], true); // → 'btn primary'
 * processClassValues(['btn', 'btn', 'primary'], false); // → 'btn btn primary'
 *
 * // Complex nested structure
 * processClassValues([
 *   'btn',
 *   ['primary', { active: true }],
 *   123,
 *   false // ignored
 * ], true); // → 'btn primary active 123'
 * ```
 *
 * @internal This is an internal utility function
 */
import type { ClassObject, ClassValue } from '../type';

export const processClassValues = (
  args: ClassValue[],
  removeDuplicates: boolean,
): string => {
  const seenClasses: string[] = [];
  let result = '';
  for (let i = 0; i < args.length; i++)
    result = processValue(args[i], result, seenClasses, removeDuplicates);
  return result;
};

/**
 * Recursively processes a single ClassValue into a string.
 *
 * Handles all possible ClassValue types including strings (with whitespace parsing),
 * numbers (converted to strings), objects (conditional classes), and nested arrays.
 * Uses optimized string parsing with direct Unicode character code comparison.
 *
 * @param value - The ClassValue to process
 * @param result - Current accumulated result string
 * @param seenClasses - Array tracking seen classes for duplicate detection
 * @param removeDuplicates - Whether to check for and skip duplicates
 * @returns Updated result string with the processed value
 *
 * @example
 * ```typescript
 * // String processing with whitespace handling
 * processValue('btn  primary\\tactive', '', [], false); // → 'btn primary active'
 *
 * // Object processing
 * processValue({ active: true, disabled: false }, 'btn', [], false); // → 'btn active'
 *
 * // Number processing
 * processValue(123, 'btn', [], false); // → 'btn 123'
 *
 * // Nested array processing
 * processValue(['primary', ['large']], 'btn', [], false); // → 'btn primary large'
 * ```
 *
 * @internal This is an internal utility function
 */
const processValue = (
  value: ClassValue,
  result: string,
  seenClasses: string[],
  removeDuplicates: boolean,
): string => {
  if (!value && value !== 0) return result;
  const typeTag = typeof value;
  if (typeTag === 'string') {
    const string = value as string;
    let currentClass = '';
    let currentResult = result;
    for (let i = 0; i < string.length; i++) {
      const char = string.charCodeAt(i);
      if (char === 32 || char === 9 || char === 10 || char === 13) {
        if (currentClass) {
          currentResult = addClassToResult(
            currentClass,
            currentResult,
            seenClasses,
            removeDuplicates,
          );
          currentClass = '';
        }
      } else currentClass += string[i];
    }
    if (currentClass)
      currentResult = addClassToResult(
        currentClass,
        currentResult,
        seenClasses,
        removeDuplicates,
      );
    return currentResult;
  } else if (typeTag === 'number')
    return addClassToResult('' + value, result, seenClasses, removeDuplicates);
  else if (typeTag === 'object') {
    let currentResult = result;
    if (Array.isArray(value))
      for (let i = 0; i < value.length; i++)
        currentResult = processValue(
          value[i],
          currentResult,
          seenClasses,
          removeDuplicates,
        );
    else {
      const obj = value as ClassObject;
      for (const key in obj)
        if (obj[key])
          currentResult = addClassToResult(
            key,
            currentResult,
            seenClasses,
            removeDuplicates,
          );
    }
    return currentResult;
  }
  return result;
};

/**
 * Adds a class to the result string with optional duplicate checking.
 *
 * Efficiently handles duplicate detection using Array.indexOf which is faster
 * than Set for small arrays (< 100 items) commonly found in class processing.
 * Optimizes string concatenation to avoid unnecessary space prepending.
 *
 * @param value - The class name to add
 * @param result - Current result string
 * @param seenClasses - Array of previously seen classes
 * @param removeDuplicates - Whether to check for duplicates
 * @returns Updated result string
 *
 * @example
 * ```typescript
 * // First class
 * addClassToResult('btn', '', [], false); // → 'btn'
 *
 * // Additional class
 * addClassToResult('primary', 'btn', [], false); // → 'btn primary'
 *
 * // Duplicate handling
 * addClassToResult('btn', 'btn primary', ['btn', 'primary'], true); // → 'btn primary'
 * ```
 *
 * @internal This is an internal utility function
 */
const addClassToResult = (
  value: string,
  result: string,
  seenClasses: string[],
  removeDuplicates: boolean,
): string => {
  if (!removeDuplicates || seenClasses.indexOf(value) === -1) {
    if (removeDuplicates) seenClasses.push(value);
    return result ? result + ' ' + value : value;
  }
  return result;
};
