import {
  ASTERISK,
  AT_SIGN,
  RBRACE,
  SEMICOLON,
  SLASH,
  WHITESPACE_MAX,
} from '../constants/charCode';
import { findBlockEnd } from './findBlockEnd';
import { findPreludeEnd } from './findPreludeEnd';
import { prefixSelector } from './prefixSelector';
import { prefixSelectorList } from './prefixSelectorList';

/**
 * At-rules whose block holds style rules, which are scoped recursively.
 * Every other block at-rule (`@keyframes`, `@font-face`, `@page`, …) is copied as is.
 */
const GROUPING_AT_RULE =
  /^@(?:-[a-z]+-)?(?:media|supports|container|layer|scope|document|starting-style)(?![\w-])/i;

/**
 * Prefixes every style rule of one stylesheet with a scope selector, in one forward pass.
 *
 * Structural characters (`{`, `}`, `;`, `,`) are located with native `indexOf`
 * searches whose results are cached until the cursor passes them. Only when a
 * string, comment, escape or unquoted `url(…)` may lie before the next structural
 * character does a rule fall back to the character-by-character scanners, which
 * skip those tokens. The caches stay valid because every query moves forward.
 *
 * @example
 * new RuleScoper('.a, .b { x: y } @media (x) { .c {} }', '.s').scopeSheet();
 * // '.s .a,.s .b{ x: y }@media (x){.s .c{}}'
 */
export class RuleScoper {
  private readonly __css__: string;
  private readonly __scope__: string;
  private __result__ = '';
  private __open__ = -1;
  private __close__ = -1;
  private __semicolon__ = -1;
  private __comma__ = -1;
  private __doubleQuote__ = -1;
  private __singleQuote__ = -1;
  private __comment__ = -1;
  private __backslash__ = -1;

  /**
   * @param css - Stylesheet text to scope
   * @param scope - Scope selector to prefix, such as `.my-widget`
   */
  constructor(css: string, scope: string) {
    this.__css__ = css;
    this.__scope__ = scope;
  }

  /**
   * Scopes the whole stylesheet.
   *
   * @returns The scoped stylesheet. Statement at-rules and non-grouping block
   * at-rules are copied unchanged, comments between rules and stray `}` are
   * dropped, and a trailing rule without a matching `}` is dropped.
   */
  scopeSheet(): string {
    this.__scopeRuleList__(0, false);
    return this.__result__;
  }

  /**
   * Appends the scoped rules that start at `cursor` to the result.
   *
   * @returns For a nested list, the index just past its closing `}`, or `-1` when
   * the text ends first; for the top-level list, the text length.
   */
  private __scopeRuleList__(cursor: number, isNested: boolean): number {
    const css = this.__css__;
    const length = css.length;
    for (;;) {
      while (cursor < length && css.charCodeAt(cursor) <= WHITESPACE_MAX)
        cursor++;
      if (cursor >= length) return isNested ? -1 : length;
      const first = css.charCodeAt(cursor);
      if (first === RBRACE) {
        if (isNested) return cursor + 1;
        cursor++;
        continue;
      }
      if (first === SLASH && css.charCodeAt(cursor + 1) === ASTERISK) {
        const commentEnd = css.indexOf('*/', cursor + 2);
        cursor = commentEnd === -1 ? length : commentEnd + 2;
        continue;
      }
      const isAtRule = first === AT_SIGN;
      const stop = this.__findPreludeEnd__(cursor, isAtRule);
      if (stop >= length) {
        if (isAtRule) this.__result__ += css.slice(cursor).trim();
        return isNested ? -1 : length;
      }
      const stopCode = css.charCodeAt(stop);
      if (stopCode === SEMICOLON) {
        this.__result__ += css.slice(cursor, stop + 1);
        cursor = stop + 1;
        continue;
      }
      if (stopCode === RBRACE) {
        if (isNested) return stop + 1;
        cursor = stop + 1;
        continue;
      }
      const prelude = css.slice(cursor, stop).trim();
      if (isAtRule && GROUPING_AT_RULE.test(prelude)) {
        const mark = this.__result__.length;
        this.__result__ += prelude + '{';
        const end = this.__scopeRuleList__(stop + 1, true);
        if (end === -1) {
          this.__result__ = this.__result__.slice(0, mark);
          return isNested ? -1 : length;
        }
        this.__result__ += '}';
        cursor = end;
        continue;
      }
      const close = this.__findBlockEnd__(stop);
      if (close === -1) return isNested ? -1 : length;
      if (isAtRule) this.__result__ += prelude + css.slice(stop, close + 1);
      else if (prelude)
        this.__result__ +=
          this.__prefixPrelude__(prelude, cursor, stop) +
          css.slice(stop, close + 1);
      cursor = close + 1;
    }
  }

  /** Finds the first structural `{` or `}` (or `;` for an at-rule) at or after `from`. */
  private __findPreludeEnd__(from: number, isAtRule: boolean): number {
    const css = this.__css__;
    this.__open__ = nextIndex(css, '{', this.__open__, from);
    this.__close__ = nextIndex(css, '}', this.__close__, from);
    let stop = Math.min(this.__open__, this.__close__);
    if (isAtRule) {
      this.__semicolon__ = nextIndex(css, ';', this.__semicolon__, from);
      if (this.__semicolon__ < stop) stop = this.__semicolon__;
    }
    return this.__nextOpaqueStart__(from) < stop
      ? findPreludeEnd(css, from, isAtRule)
      : stop;
  }

  /** Finds the `}` matching the `{` at `open`, or `-1` when the block never closes. */
  private __findBlockEnd__(open: number): number {
    const css = this.__css__;
    const length = css.length;
    let depth = 0;
    let position = open + 1;
    for (;;) {
      this.__open__ = nextIndex(css, '{', this.__open__, position);
      this.__close__ = nextIndex(css, '}', this.__close__, position);
      const token = Math.min(this.__open__, this.__close__);
      if (this.__nextOpaqueStart__(position) < token)
        return findBlockEnd(css, open);
      if (token >= length) return -1;
      if (token === this.__open__) depth++;
      else if (depth-- === 0) return token;
      position = token + 1;
    }
  }

  /** Index of the first quote, comment opener or backslash at or after `from`. */
  private __nextOpaqueStart__(from: number): number {
    const css = this.__css__;
    this.__doubleQuote__ = nextIndex(css, '"', this.__doubleQuote__, from);
    this.__singleQuote__ = nextIndex(css, "'", this.__singleQuote__, from);
    this.__comment__ = nextIndex(css, '/*', this.__comment__, from);
    this.__backslash__ = nextIndex(css, '\\', this.__backslash__, from);
    return Math.min(
      this.__doubleQuote__,
      this.__singleQuote__,
      this.__comment__,
      this.__backslash__,
    );
  }

  /** Prefixes the selector prelude that spans `[from, stop)` of the text. */
  private __prefixPrelude__(prelude: string, from: number, stop: number) {
    this.__comma__ = nextIndex(this.__css__, ',', this.__comma__, from);
    return this.__comma__ < stop
      ? prefixSelectorList(prelude, this.__scope__)
      : prefixSelector(prelude, this.__scope__);
  }
}

/** Refreshes a cached search result once the cursor has passed it; `css.length` means none. */
const nextIndex = (
  css: string,
  search: string,
  cached: number,
  from: number,
): number => {
  if (cached >= from) return cached;
  const found = css.indexOf(search, from);
  return found === -1 ? css.length : found;
};
