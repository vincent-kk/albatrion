import { classNames } from './classNames';
import type { ClassNamesOptions, ClassValue } from './type';

/**
 * Convenient class names utility with variadic arguments.
 *
 * A lightweight wrapper around [classNames](./classNames.ts) that accepts variadic arguments
 * for maximum convenience. Uses performance-optimized default options:
 * - No duplicate removal (assumes clean input)
 * - No whitespace normalization (assumes clean input)
 * - Empty value filtering enabled (removes falsy values)
 *
 * @param args - Variadic class values to combine
 * @returns Combined class names as a string
 *
 * @example
 * ```typescript
 * // Basic usage (most common)
 * cx('btn', 'btn-primary'); // → 'btn btn-primary'
 *
 * // Conditional classes
 * cx('btn', isActive && 'active'); // → 'btn active'
 *
 * // Object syntax
 * cx('btn', {
 *   'btn-active': isActive,
 *   'btn-disabled': isDisabled
 * }); // → 'btn btn-active'
 *
 * // Mixed usage
 * cx('btn', 123, true, { active: false }); // → 'btn 123'
 *
 * // Nested arrays
 * cx('btn', ['primary', ['large']]); // → 'btn primary large'
 *
 * // React component example
 * const Button = ({ variant, disabled, children }) => (
 *   <button className={cx(
 *     'btn',
 *     `btn-${variant}`,
 *     { 'btn-disabled': disabled }
 *   )}>
 *     {children}
 *   </button>
 * );
 * ```
 */
export const cx = (...args: ClassValue[]): string =>
  classNames(args, defaultOptions);

const defaultOptions: ClassNamesOptions = {
  removeDuplicates: false,
  normalizeWhitespace: false,
  filterEmpty: true,
};
