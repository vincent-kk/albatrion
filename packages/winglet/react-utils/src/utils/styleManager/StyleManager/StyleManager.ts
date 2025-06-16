import { compress } from './utils/compress';

/**
 * A scoped CSS management system that provides efficient style injection and cleanup.
 * 
 * StyleManager allows you to:
 * - Create isolated CSS scopes using data attributes
 * - Add/remove styles dynamically with automatic DOM updates
 * - Batch style updates using requestAnimationFrame for optimal performance
 * - Support both modern CSSStyleSheet API and fallback style element injection
 * - Automatically scope CSS selectors to prevent style conflicts
 * - Compress CSS for production optimization
 * 
 * Each StyleManager instance manages styles for a specific scope, identified by a unique scopeId.
 * Styles are automatically prefixed with `[data-scope="{scopeId}"]` to ensure isolation.
 * 
 * @example
 * ```typescript
 * // Get a manager for a specific scope
 * const manager = StyleManager.get('my-component');
 * 
 * // Add scoped styles
 * manager.add('button-style', `
 *   .btn {
 *     background: blue;
 *     color: white;
 *     padding: 8px 16px;
 *   }
 *   .btn:hover {
 *     background: darkblue;
 *   }
 * `);
 * 
 * // The CSS will be applied as:
 * // [data-scope="my-component"] .btn { ... }
 * // [data-scope="my-component"] .btn:hover { ... }
 * 
 * // Remove specific styles
 * manager.remove('button-style');
 * 
 * // Clean up the entire scope
 * manager.destroy();
 * ```
 * 
 * @example
 * ```typescript
 * // Multiple styles in the same scope
 * const manager = StyleManager.get('dashboard');
 * 
 * manager.add('layout', `
 *   .container { display: grid; gap: 1rem; }
 *   .sidebar { grid-area: sidebar; }
 * `);
 * 
 * manager.add('theme', `
 *   .dark { background: #333; color: white; }
 *   .light { background: white; color: #333; }
 * `);
 * 
 * manager.add('responsive', `
 *   @media (max-width: 768px) {
 *     .container { grid-template-columns: 1fr; }
 *   }
 * `);
 * ```
 */
export class StyleManager {
  private static __SHEETS__ = new Map<string, StyleManager>();
  private __styles__ = new Map<string, string>();
  private __element__: HTMLStyleElement | null = null;
  private __sheet__: CSSStyleSheet | null = null;
  private __dirty__ = false;
  private __frameId__ = 0;

  private constructor(private scopeId: string) {}

  /**
   * Gets or creates a StyleManager instance for the specified scope.
   * 
   * This is a singleton factory method that ensures only one StyleManager
   * instance exists per scope ID. If a manager for the scope doesn't exist,
   * it creates a new one and stores it in the internal registry.
   * 
   * @param scopeId - The unique identifier for the style scope
   * @returns The StyleManager instance for the specified scope
   * 
   * @example
   * ```typescript
   * const manager1 = StyleManager.get('my-scope');
   * const manager2 = StyleManager.get('my-scope');
   * console.log(manager1 === manager2); // true - same instance
   * ```
   */
  public static get(scopeId: string): StyleManager {
    let manager = this.__SHEETS__.get(scopeId);
    if (!manager) {
      manager = new StyleManager(scopeId);
      this.__SHEETS__.set(scopeId, manager);
    }
    return manager;
  }

  /**
   * Adds or updates a CSS style in this scope.
   * 
   * The CSS will be automatically scoped with the scope ID and applied to the DOM.
   * Updates are batched using requestAnimationFrame for optimal performance.
   * If a style with the same ID already exists, it will be replaced.
   * 
   * @param id - Unique identifier for this specific style within the scope
   * @param css - The CSS string to add (will be automatically scoped)
   * 
   * @example
   * ```typescript
   * const manager = StyleManager.get('my-component');
   * 
   * manager.add('button-style', `
   *   .btn {
   *     background: blue;
   *     color: white;
   *   }
   * `);
   * 
   * // CSS will be applied as:
   * // [data-scope="my-component"] .btn { background: blue; color: white; }
   * ```
   */
  public add(id: string, css: string): void {
    this.__styles__.set(id, css);
    if (!this.__dirty__) {
      this.__dirty__ = true;
      this.__frameId__ = requestAnimationFrame(() => this.__flush__());
    }
  }

  /**
   * Removes a specific CSS style from this scope.
   * 
   * If the style exists and is successfully removed, the DOM will be updated
   * in the next animation frame to reflect the change.
   * 
   * @param id - The unique identifier of the style to remove
   * 
   * @example
   * ```typescript
   * const manager = StyleManager.get('my-component');
   * 
   * // Add a style
   * manager.add('temp-style', '.temp { color: red; }');
   * 
   * // Later, remove it
   * manager.remove('temp-style');
   * ```
   */
  public remove(id: string): void {
    if (this.__styles__.delete(id) && !this.__dirty__) {
      this.__dirty__ = true;
      this.__frameId__ = requestAnimationFrame(() => this.__flush__());
    }
  }

  /**
   * Completely destroys this StyleManager instance and removes all associated styles from the DOM.
   * 
   * This method performs a complete cleanup by:
   * - Canceling any pending animation frames
   * - Removing the CSSStyleSheet from document.adoptedStyleSheets (modern browsers)
   * - Removing the style element from the DOM (fallback browsers)
   * - Clearing all cached styles
   * - Removing this instance from the global registry
   * 
   * After calling destroy(), this StyleManager instance should not be used.
   * 
   * @example
   * ```typescript
   * const manager = StyleManager.get('my-component');
   * manager.add('style1', '.class1 { color: red; }');
   * manager.add('style2', '.class2 { color: blue; }');
   * 
   * // Clean up everything
   * manager.destroy();
   * 
   * // The scope is now completely removed from DOM and registry
   * ```
   */
  public destroy(): void {
    if (this.__frameId__) cancelAnimationFrame(this.__frameId__);
    if (this.__sheet__) {
      const sheets = document.adoptedStyleSheets;
      const newSheets: CSSStyleSheet[] = [];
      for (let i = 0; i < sheets.length; i++) {
        if (sheets[i] !== this.__sheet__) newSheets.push(sheets[i]);
      }
      document.adoptedStyleSheets = newSheets;
    }
    if (this.__element__) this.__element__.remove();
    this.__styles__.clear();
    StyleManager.__SHEETS__.delete(this.scopeId);
  }

  private __flush__(): void {
    this.__dirty__ = false;
    let result = '';
    const value = Array.from(this.__styles__.values());
    for (let i = 0; i < value.length; i++) {
      const css = value[i];
      result += this.__scopeCSS__(css);
      if (i < value.length - 1) result += '\n';
    }
    const compiled = compress(result);
    this.__applyCSS__(compiled);
  }

  private __scopeCSS__(css: string): string {
    const scope = `[data-scope="${this.scopeId}"]`;
    const lines = css.split('}');
    let result = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const parts = line.split('{');
      if (parts.length !== 2) continue;
      const selector = parts[0].trim();
      const rules = parts[1];
      if (selector[0] === '@' || selector === ':root' || selector === ':host')
        result += `${selector}{${rules}}`;
      else result += `${scope} ${selector}{${rules}}`;
    }

    return result;
  }

  private __applyCSS__(css: string): void {
    if (
      typeof CSSStyleSheet !== 'undefined' &&
      'replaceSync' in CSSStyleSheet.prototype
    ) {
      if (!this.__sheet__) {
        this.__sheet__ = new CSSStyleSheet();
        document.adoptedStyleSheets = [
          ...document.adoptedStyleSheets,
          this.__sheet__,
        ];
      }
      this.__sheet__.replaceSync(css);
    } else {
      if (!this.__element__) {
        this.__element__ = document.createElement('style');
        this.__element__.dataset.scope = this.scopeId;
        document.head.appendChild(this.__element__);
      }
      this.__element__.textContent = css;
    }
  }
}
