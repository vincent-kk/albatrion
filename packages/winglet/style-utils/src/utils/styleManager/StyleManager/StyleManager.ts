import { getRandomString } from '@winglet/common-utils/lib';

import { compressCss } from '@/style-utils/utils/compressCss/compressCss';

import type { StyleManagerConfig, StyleRoot } from './type';

/**
 * A scoped CSS management system that provides efficient style injection and cleanup.
 * It supports both regular DOM and Shadow DOM environments.
 *
 * StyleManager allows you to:
 * - Create isolated CSS scopes using data attributes
 * - Add/remove styles dynamically with automatic DOM updates
 * - Batch style updates using requestAnimationFrame for optimal performance
 * - Support both modern CSSStyleSheet API and fallback style element injection
 * - Automatically scope CSS selectors to prevent style conflicts
 * - Compress CSS for production optimization
 * - Work within Shadow DOM boundaries
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
 * // Using with Shadow DOM
 * const shadowRoot = element.attachShadow({ mode: 'open' });
 * const manager = StyleManager.get('shadow-component', { shadowRoot });
 *
 * manager.add('shadow-styles', `
 *   :host { display: block; }
 *   .content { padding: 1rem; }
 * `);
 * ```
 */
export class StyleManager {
  private static __SHEETS__ = new Map<string, StyleManager>();
  private static __SHADOW_ID_KEY__ = Symbol('__styleManagerId__');
  private __processedStyles__ = new Map<string, string>();
  private __element__: HTMLStyleElement | null = null;
  private __sheet__: CSSStyleSheet | null = null;
  private __dirty__ = false;
  private __frameId__ = 0;
  private __scopePrefix__: string;
  private __root__: StyleRoot;
  private __isShadowDOM__: boolean;
  private __instanceKey__: string;

  private constructor(
    private scopeId: string,
    instanceKey: string,
    config?: StyleManagerConfig,
  ) {
    // 스코프 접두사를 미리 계산하여 반복 계산 방지
    this.__scopePrefix__ = `[data-scope="${scopeId}"]`;

    // Shadow DOM 여부를 미리 계산하여 런타임 체크 최소화
    this.__root__ = config?.shadowRoot || document;
    this.__isShadowDOM__ = !!config?.shadowRoot;

    // 인스턴스 키는 get() 메서드에서 전달받은 것을 사용
    this.__instanceKey__ = instanceKey;
  }

  /**
   * Gets or creates a StyleManager instance for the specified scope.
   *
   * This is a singleton factory method that ensures only one StyleManager
   * instance exists per scope ID and target (document or shadow root).
   * If a manager for the scope doesn't exist, it creates a new one and stores
   * it in the internal registry.
   *
   * @param scopeId - The unique identifier for the style scope
   * @param config - Optional configuration for the StyleManager
   * @returns The StyleManager instance for the specified scope
   *
   * @example
   * ```typescript
   * const manager1 = StyleManager.get('my-scope');
   * const manager2 = StyleManager.get('my-scope');
   * console.log(manager1 === manager2); // true - same instance
   *
   * // With Shadow DOM
   * const shadowManager = StyleManager.get('shadow-scope', { shadowRoot });
   * ```
   */
  public static get(
    scopeId: string,
    config?: StyleManagerConfig,
  ): StyleManager {
    // Shadow DOM을 위한 고유 키 생성 로직 최적화
    let instanceKey: string;
    if (config?.shadowRoot) {
      // Symbol을 사용하여 더 안전한 프로퍼티 접근
      const shadowRoot = config.shadowRoot as any;
      if (!shadowRoot[this.__SHADOW_ID_KEY__])
        shadowRoot[this.__SHADOW_ID_KEY__] = getRandomString(36);
      instanceKey = `${scopeId}:shadow:${shadowRoot[this.__SHADOW_ID_KEY__]}`;
    } else instanceKey = scopeId;
    let manager = this.__SHEETS__.get(instanceKey);
    if (!manager) {
      manager = new StyleManager(scopeId, instanceKey, config);
      this.__SHEETS__.set(instanceKey, manager);
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
   * @param compressed - If true, skips compression for this CSS (default: false)
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
   *
   * @example
   * ```typescript
   * // Using pre-compressed CSS
   * manager.add('compressed-style', '.btn{background:blue;color:white}', true);
   * ```
   */
  public add(id: string, css: string, compressed: boolean = false): void {
    if (!css.trim()) return;

    const previousProcessedCSS = this.__processedStyles__.get(id);

    // Pre-process the scoped CSS for this specific ID
    const scopedCSS = this.__scopeCSS__(css);
    const compressedCSS = compressed ? scopedCSS : compressCss(scopedCSS);

    // Only mark as dirty if processed CSS actually changed
    if (previousProcessedCSS !== compressedCSS) {
      this.__processedStyles__.set(id, compressedCSS);
      this.__scheduleDOMUpdate__();
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
    if (this.__processedStyles__.delete(id)) this.__scheduleDOMUpdate__();
  }

  /**
   * Completely destroys this StyleManager instance and removes all associated styles from the DOM.
   *
   * This method performs a complete cleanup by:
   * - Canceling any pending animation frames
   * - Removing the CSSStyleSheet from adoptedStyleSheets (modern browsers)
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
    // 1. 예약된 애니메이션 프레임 취소
    if (this.__frameId__) {
      cancelAnimationFrame(this.__frameId__);
      this.__frameId__ = 0;
    }

    // 2. CSSStyleSheet 정리 (modern browsers)
    if (this.__sheet__ && 'adoptedStyleSheets' in this.__root__) {
      const sheets = this.__root__.adoptedStyleSheets;
      const targetSheet = this.__sheet__;
      let foundIndex = -1;

      // More efficient array search and removal
      for (let i = 0; i < sheets.length; i++) {
        if (sheets[i] === targetSheet) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex !== -1) {
        // Use splice instead of creating a new array (more efficient)
        const newSheets = new Array(sheets.length - 1);
        for (let i = 0; i < foundIndex; i++) newSheets[i] = sheets[i];
        for (let i = foundIndex + 1; i < sheets.length; i++)
          newSheets[i - 1] = sheets[i];
        this.__root__.adoptedStyleSheets = newSheets;
      }
      this.__sheet__ = null;
    }

    // 3. Clean up style element (fallback browsers)
    if (this.__element__) {
      this.__element__.remove();
      this.__element__ = null;
    }

    // 4. Clean up internal state
    this.__processedStyles__.clear();
    this.__dirty__ = false;

    // 5. Remove from global registry - use instanceKey
    StyleManager.__SHEETS__.delete(this.__instanceKey__);
  }

  private __scheduleDOMUpdate__(): void {
    if (!this.__dirty__) {
      this.__dirty__ = true;
      this.__frameId__ = requestAnimationFrame(() => this.__flush__());
    }
  }

  private __scopeCSS__(css: string): string {
    // If it's Shadow DOM, no need to scope
    if (this.__isShadowDOM__) return css;

    const scope = this.__scopePrefix__;
    let result = '';
    let currentIndex = 0;
    const cssLength = css.length;

    // CSS 파싱 최적화: indexOf 대신 더 효율적인 방법 사용
    while (currentIndex < cssLength) {
      const ruleEnd = css.indexOf('}', currentIndex);
      if (ruleEnd === -1) break;

      const rule = css.slice(currentIndex, ruleEnd + 1);
      const braceIndex = rule.indexOf('{');

      if (braceIndex === -1) {
        currentIndex = ruleEnd + 1;
        continue;
      }

      const selector = rule.slice(0, braceIndex).trim();
      const declarations = rule.slice(braceIndex);

      if (!selector) {
        currentIndex = ruleEnd + 1;
        continue;
      }

      if (selector[0] === '@' || selector === ':root' || selector === ':host')
        result += rule;
      else result += scope + ' ' + selector + declarations;

      currentIndex = ruleEnd + 1;
    }

    return result;
  }

  private __flush__(): void {
    this.__dirty__ = false;
    this.__frameId__ = 0;

    if (this.__processedStyles__.size === 0) {
      this.__applyCSS__('');
      return;
    }
    const styleCount = this.__processedStyles__.size;
    const styles = new Array(styleCount);
    let index = 0;
    for (const css of this.__processedStyles__.values()) styles[index++] = css;
    const result = styles.join('\n');
    this.__applyCSS__(result);
  }

  private __applyCSS__(css: string): void {
    if (
      typeof CSSStyleSheet !== 'undefined' &&
      'replaceSync' in CSSStyleSheet.prototype &&
      'adoptedStyleSheets' in this.__root__
    ) {
      if (!this.__sheet__) {
        this.__sheet__ = new CSSStyleSheet();
        // spread operator 대신 직접 배열 생성으로 성능 개선
        const currentSheets = this.__root__.adoptedStyleSheets;
        const newSheets = new Array(currentSheets.length + 1);
        for (let i = 0; i < currentSheets.length; i++)
          newSheets[i] = currentSheets[i];
        newSheets[currentSheets.length] = this.__sheet__;
        this.__root__.adoptedStyleSheets = newSheets;
      }
      try {
        this.__sheet__.replaceSync(css);
      } catch (error) {
        console.warn(
          `StyleManager: Failed to apply CSS for scope "${this.scopeId}":`,
          error,
        );
      }
    } else {
      if (!this.__element__) {
        this.__element__ = document.createElement('style');
        this.__element__.dataset.scope = this.scopeId;
        // If it's Shadow DOM, append to shadowRoot directly
        if (this.__isShadowDOM__) this.__root__.appendChild(this.__element__);
        else document.head.appendChild(this.__element__);
      }
      this.__element__.textContent = css;
    }
  }
}
