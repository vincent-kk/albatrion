import type { ClassValue } from './type';

/**
 * Concatenates CSS class names conditionally, similar to clsx/classnames but more lightweight.
 * Accepts various input types including strings, numbers, arrays, and objects.
 * Filters out falsy values and handles nested structures recursively.
 *
 * @param args - Variable number of class value arguments that can be strings, numbers, arrays, or objects
 * @returns A single concatenated string of class names, separated by spaces
 *
 * @example
 * ```typescript
 * // String and number inputs
 * cx('btn', 'primary') // 'btn primary'
 * cx('btn', 123) // 'btn 123'
 *
 * // Conditional classes with falsy values
 * cx('btn', false && 'hidden', null, undefined, 'active') // 'btn active'
 *
 * // Object notation for conditional classes
 * cx('btn', { 'btn-primary': true, 'btn-disabled': false }) // 'btn btn-primary'
 *
 * // Array inputs with nesting
 * cx(['btn', 'primary'], ['large', false && 'hidden']) // 'btn primary large'
 *
 * // Mixed inputs
 * cx('btn', { primary: true }, ['large'], null, 'active') // 'btn primary large active'
 * ```
 */
export const cx = (...args: ClassValue[]): string => {
  let index = 0,
    length = args.length,
    cursor: any,
    result = '';
  for (; index < length; index++) {
    if ((cursor = args[index]) && (cursor = getSegment(cursor))) {
      result = result ? result + ' ' + cursor : cursor;
    }
  }
  return result;
};

/**
 * Helper function that processes a single ClassValue input and converts it to a string.
 * Handles different input types: strings, numbers, arrays, and objects.
 * For objects, only includes keys where the corresponding value is truthy.
 * For arrays, recursively processes each element.
 *
 * @param input - A single class value that can be a string, number, array, or object
 * @returns A processed string of class names, or empty string if no valid classes found
 *
 * @example
 * ```typescript
 * // String/number input
 * getSegment('btn') // 'btn'
 * getSegment(42) // '42'
 *
 * // Object input (conditional classes)
 * getSegment({ 'active': true, 'hidden': false }) // 'active'
 *
 * // Array input (recursive processing)
 * getSegment(['btn', 'primary']) // 'btn primary'
 * getSegment(['btn', { 'active': true }]) // 'btn active'
 * ```
 */
const getSegment = (input: ClassValue): string => {
  let key: any,
    cursor: any,
    result = '';
  if (typeof input === 'string' || typeof input === 'number')
    return result + input;
  if (input == null || typeof input !== 'object') return result;
  if (Array.isArray(input)) {
    for (key = 0; key < input.length; key++)
      if ((cursor = input[key]) && (cursor = getSegment(cursor)))
        result = result ? result + ' ' + cursor : cursor;
  } else
    for (key in input)
      if (input[key]) result = result ? result + ' ' + key : key;
  return result;
};
