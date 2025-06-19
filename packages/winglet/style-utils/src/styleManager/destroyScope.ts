import { StyleManager } from './StyleManager';

/**
 * Destroys a specific style scope and removes all associated styles from the DOM.
 * 
 * This function completely cleans up a style scope by:
 * - Canceling any pending animation frames
 * - Removing the scope's stylesheet from document.adoptedStyleSheets (if using CSSStyleSheet)
 * - Removing the scope's style element from the DOM (if using fallback method)
 * - Clearing all cached styles for the scope
 * - Removing the scope instance from the StyleManager registry
 * 
 * @param scopeId - The unique identifier of the scope to destroy
 * 
 * @example
 * ```typescript
 * // Create and use a style scope
 * const addStyle = styleManagerFactory('my-scope');
 * const removeStyle = addStyle('button-style', '.button { color: red; }');
 * 
 * // Later, destroy the entire scope
 * destroyScope('my-scope');
 * ```
 */
export const destroyScope = (scopeId: string): void =>
  StyleManager.get(scopeId).destroy();
