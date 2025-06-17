/**
 * Converts a boolean attributes object to a React-compatible data attributes object.
 * 
 * This utility function transforms an object with boolean values into an object where:
 * - `true` values become `true`
 * - `false` values become `undefined` (which React will omit from the DOM)
 * 
 * This is particularly useful for conditional data attributes in React components,
 * as React will only render attributes with truthy values.
 * 
 * @param attrs - An object where keys are attribute names and values are booleans
 * @returns An object where true values remain true and false values become undefined
 * 
 * @example
 * ```typescript
 * const attributes = dataAttributes({
 *   'data-active': true,
 *   'data-disabled': false,
 *   'data-loading': true
 * });
 * 
 * console.log(attributes);
 * // Output: { 'data-active': true, 'data-disabled': undefined, 'data-loading': true }
 * 
 * // Usage in React component
 * <div {...attributes}>
 *   Content
 * </div>
 * // Renders: <div data-active data-loading>Content</div>
 * ```
 * 
 * @example
 * ```typescript
 * // Dynamic attributes based on component state
 * const componentAttributes = dataAttributes({
 *   'data-theme-dark': isDarkMode,
 *   'data-size-large': size === 'large',
 *   'data-interactive': !disabled
 * });
 * 
 * return <button {...componentAttributes}>Click me</button>;
 * ```
 */
export const dataAttributes = (
  attrs: Record<string, boolean>,
): Record<string, true | undefined> => {
  const result: Record<string, true | undefined> = {};
  for (const key in attrs) if (attrs[key]) result[key] = true;
  return result;
};
