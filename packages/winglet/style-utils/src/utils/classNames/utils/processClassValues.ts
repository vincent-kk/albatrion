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
import type { ClassValue } from '../type';

export const processClassValues = (
  args: ClassValue[],
  removeDuplicates: boolean,
): string => {
  const processedClasses: string[] = [];
  let result = '';
  for (let i = 0; i < args.length; i++)
    result = processValue(args[i], result, processedClasses, removeDuplicates);
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
 * @param processedClasses - Array tracking seen classes for duplicate detection
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
  processedClasses: string[],
  removeDuplicates: boolean,
): string => {
  if (!value && value !== 0) return result;

  switch (typeof value) {
    case 'string': {
      let currentClass = '';
      let currentResult = result;
      for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        // Check for whitespace characters (space, tab, newline, carriage return)
        if (char === 32 || char === 9 || char === 10 || char === 13) {
          if (
            currentClass &&
            (!removeDuplicates || processedClasses.indexOf(currentClass) === -1)
          ) {
            if (removeDuplicates) processedClasses.push(currentClass);
            currentResult = currentResult
              ? currentResult + ' ' + currentClass
              : currentClass;
            currentClass = '';
          }
        } else currentClass += value[i];
      }
      if (
        currentClass &&
        (!removeDuplicates || processedClasses.indexOf(currentClass) === -1)
      ) {
        if (removeDuplicates) processedClasses.push(currentClass);
        currentResult = currentResult
          ? currentResult + ' ' + currentClass
          : currentClass;
      }
      return currentResult;
    }
    case 'number': {
      const numberValue = '' + value;
      if (!removeDuplicates || processedClasses.indexOf(numberValue) === -1) {
        if (removeDuplicates) processedClasses.push(numberValue);
        return result ? result + ' ' + numberValue : numberValue;
      }
      return result;
    }
    case 'object': {
      let currentResult = result;
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          currentResult = processValue(
            value[i],
            currentResult,
            processedClasses,
            removeDuplicates,
          );
        }
      } else {
        for (const key in value) {
          if (
            value[key] &&
            (!removeDuplicates || processedClasses.indexOf(key) === -1)
          ) {
            if (removeDuplicates) processedClasses.push(key);
            currentResult = currentResult ? currentResult + ' ' + key : key;
          }
        }
      }
      return currentResult;
    }
    default:
      return result;
  }
};
