import { compress } from './utils/compress';

export class StyleManager {
  private static __SHEETS__ = new Map<string, StyleManager>();
  private __styles__ = new Map<string, string>();
  private __element__: HTMLStyleElement | null = null;
  private __sheet__: CSSStyleSheet | null = null;
  private __dirty__ = false;
  private __frameId__ = 0;

  private constructor(private scopeId: string) {}

  public static get(scopeId: string): StyleManager {
    let manager = this.__SHEETS__.get(scopeId);
    if (!manager) {
      manager = new StyleManager(scopeId);
      this.__SHEETS__.set(scopeId, manager);
    }
    return manager;
  }

  public add(id: string, css: string): void {
    this.__styles__.set(id, css);
    if (!this.__dirty__) {
      this.__dirty__ = true;
      this.__frameId__ = requestAnimationFrame(() => this.__flush__());
    }
  }

  public remove(id: string): void {
    if (this.__styles__.delete(id) && !this.__dirty__) {
      this.__dirty__ = true;
      this.__frameId__ = requestAnimationFrame(() => this.__flush__());
    }
  }

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
