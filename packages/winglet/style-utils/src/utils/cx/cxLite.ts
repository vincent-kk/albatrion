import type { ClassValue } from './type';

/**
 * Lightweight version of the cx function that concatenates CSS class names.
 * Only handles simple truthy/falsy filtering without object or array processing.
 * Provides better performance for basic use cases where complex input types are not needed.
 *
 * @param args - Variable number of class value arguments (primarily strings and numbers)
 * @returns A single concatenated string of class names, separated by spaces
 *
 * @example
 * ```typescript
 * // Basic string concatenation
 * cxLite('btn', 'primary') // 'btn primary'
 * cxLite('btn', 'primary', 'large') // 'btn primary large'
 *
 * // Conditional classes with falsy values
 * cxLite('btn', false && 'hidden', null, undefined, 'active') // 'btn active'
 * cxLite('btn', condition ? 'active' : '', 'primary') // 'btn primary' (if condition is false)
 *
 * // Number inputs
 * cxLite('item', 123, 'selected') // 'item 123 selected'
 *
 * // Note: Unlike cx(), this function does NOT process objects or arrays
 * // cxLite('btn', { primary: true }) // This will not work as expected
 * // Use cx() instead for complex input types
 * ```
 *
 * @see {@link cx} For full-featured class name concatenation with object/array support
 */
export const cxLite = (...args: ClassValue[]): string => {
  let index = 0,
    length = args.length,
    cursor: any,
    result = '';
  for (; index < length; index++)
    if ((cursor = args[index]))
      result = result ? result + ' ' + cursor : cursor;
  return result;
};
