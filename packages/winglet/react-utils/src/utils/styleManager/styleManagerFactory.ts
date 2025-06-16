import type { Fn } from '@aileron/declare';

import { StyleManager } from './StyleManager';

/**
 * Creates a style manager factory for a specific scope that can add and remove scoped CSS styles.
 * 
 * This factory function returns a curried function that allows you to:
 * - Add CSS styles to a specific scope with automatic scoping
 * - Get a cleanup function to remove specific styles
 * - Automatically batch style updates using requestAnimationFrame for optimal performance
 * - Handle both modern CSSStyleSheet API and fallback style element injection
 * 
 * The returned function adds CSS styles that are automatically scoped with `[data-scope="{scopeId}"]`
 * selector prefix, ensuring styles only apply to elements within that scope.
 * 
 * @param scopeId - The unique identifier for the style scope
 * @returns A function that accepts (styleId, cssString) and returns a cleanup function
 * 
 * @example
 * ```typescript
 * // Create a style manager for a specific component scope
 * const addStyle = styleManagerFactory('header-component');
 * 
 * // Add a style and get cleanup function
 * const removeButtonStyle = addStyle('button-primary', `
 *   .btn-primary {
 *     background-color: blue;
 *     color: white;
 *     padding: 8px 16px;
 *   }
 * `);
 * 
 * // The CSS will be scoped as:
 * // [data-scope="header-component"] .btn-primary { ... }
 * 
 * // Later, remove the specific style
 * removeButtonStyle();
 * 
 * // Or destroy the entire scope
 * destroyScope('header-component');
 * ```
 * 
 * @example
 * ```typescript
 * // Multiple styles in the same scope
 * const addStyle = styleManagerFactory('my-widget');
 * 
 * const cleanupFns = [
 *   addStyle('layout', '.container { display: flex; }'),
 *   addStyle('theme', '.dark { background: #333; }'),
 *   addStyle('responsive', '@media (max-width: 768px) { .container { flex-direction: column; } }')
 * ];
 * 
 * // Clean up all styles
 * cleanupFns.forEach(cleanup => cleanup());
 * ```
 */
export const styleManagerFactory =
  (scopeId: string): Fn<[styleId: string, cssString: string], Fn> =>
  (styleId: string, cssString: string) => {
    StyleManager.get(scopeId).add(styleId, cssString);
    return () => StyleManager.get(scopeId).remove(styleId);
  };
