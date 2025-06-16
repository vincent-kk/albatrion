/**
 * Converts a boolean condition to a React-compatible attribute value.
 * 
 * This utility function transforms a boolean into either `true` or `undefined`:
 * - `true` input returns `true`
 * - `false` input returns `undefined` (which React will omit from the DOM)
 * 
 * This is useful for conditional attributes in React components where you want
 * the attribute to be present when true and completely absent when false.
 * 
 * @param condition - A boolean value to convert
 * @returns `true` if condition is true, `undefined` if condition is false
 * 
 * @example
 * ```typescript
 * const isActive = true;
 * const isDisabled = false;
 * 
 * <button 
 *   data-active={dataCondition(isActive)}     // Will render as data-active
 *   data-disabled={dataCondition(isDisabled)} // Will not render
 * >
 *   Click me
 * </button>
 * // Renders: <button data-active>Click me</button>
 * ```
 * 
 * @example
 * ```typescript
 * // Usage with dynamic conditions
 * const hasError = errorMessage.length > 0;
 * const isLoading = status === 'loading';
 * 
 * <div 
 *   data-error={dataCondition(hasError)}
 *   data-loading={dataCondition(isLoading)}
 *   className="form-field"
 * >
 *   {children}
 * </div>
 * ```
 * 
 * @example
 * ```typescript
 * // Combining with other utilities
 * const attributes = {
 *   'data-visible': dataCondition(isVisible),
 *   'data-expanded': dataCondition(isOpen),
 *   ...dataAttributes({
 *     'data-size-large': size === 'large',
 *     'data-theme-dark': theme === 'dark'
 *   })
 * };
 * ```
 */
export const dataCondition = (condition: boolean): true | undefined =>
  condition ? true : undefined;
