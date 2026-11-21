import { createCssOpaqueProbe } from '../../../utils/cssTokens/createCssOpaqueProbe';
import { getCssOpaqueEnd } from '../../../utils/cssTokens/getCssOpaqueEnd';
import { resolveCssOpaqueCandidate } from '../../../utils/cssTokens/resolveCssOpaqueCandidate';
import {
  ASTERISK,
  AT_SIGN,
  COLON,
  NON_ASCII_MIN,
  RBRACE,
  SEMICOLON,
  SLASH,
  WHITESPACE_MAX,
} from '../constants/charCode';
import { prefixSelector } from './prefixSelector';
import { prefixSelectorList } from './prefixSelectorList';
import { trimSelector } from './trimSelector';

/**
 * At-rules whose block holds style rules, which are scoped recursively.
 * Every other block at-rule (`@keyframes`, `@font-face`, `@page`, …) is copied as is.
 */
const GROUPING_AT_RULE =
  /^@(?:-[a-z]+-)?(?:media|supports|container|layer|scope|document|starting-style)(?![\w-])/i;

/** Driver-owned native candidate state is initialized once outside stylesheet processing. */
const OPAQUE_START = createCssOpaqueProbe();

/**
 * Prefixes every style rule of one stylesheet with a scope selector, in one forward pass.
 *
 * Native brace candidates are cached for flat rules. The shared lexical position
 * model skips opaque tokens and components before any candidate is accepted.
 *
 * @example
 * new RuleScoper('.a, .b { x: y } @media (x) { .c {} }', '.s').scopeSheet();
 * // '.s .a,.s .b{ x: y }@media (x){.s .c{}}'
 */
export class RuleScoper {
  private readonly __css__: string;
  /** Scope selector followed by one space, built once for every prefixed selector. */
  private readonly __prefix__: string;
  /** Where the last `__scopeRuleList__` call stopped: past its `}`, or `-1` at an unterminated end. */
  private __end__ = 0;
  private __open__ = -1;
  private __close__ = -1;
  private __semicolon__ = -1;
  private __comma__ = -1;
  private __opaque__ = -1;

  /**
   * @param css - Stylesheet text to scope
   * @param scope - Scope selector to prefix, such as `.my-widget`
   */
  constructor(css: string, scope: string) {
    this.__css__ = css;
    this.__prefix__ = scope + ' ';
  }

  /**
   * Scopes the whole stylesheet.
   *
   * @returns The scoped stylesheet. Statement at-rules and non-grouping block
   * at-rules are copied unchanged, comments between rules and stray `}` are
   * dropped, and a trailing rule without a matching `}` is dropped.
   */
  scopeSheet(): string {
    return this.__scopeRuleList__(0, false);
  }

  /**
   * Scopes the rule list that starts at `cursor`.
   *
   * @returns The scoped rules. Sets `__end__` to the index just past a nested
   * list's closing `}`, or to `-1` when the text ends inside a nested list.
   */
  private __scopeRuleList__(cursor: number, isNested: boolean): string {
    const css = this.__css__;
    const length = css.length;
    let result = '';
    for (;;) {
      while (cursor < length && css.charCodeAt(cursor) <= WHITESPACE_MAX)
        cursor++;
      if (cursor >= length) {
        this.__end__ = -1;
        return result;
      }
      const first = css.charCodeAt(cursor);
      if (first === RBRACE) {
        if (isNested) {
          this.__end__ = cursor + 1;
          return result;
        }
        cursor++;
        continue;
      }
      if (first === SLASH && css.charCodeAt(cursor + 1) === ASTERISK) {
        cursor = getCssOpaqueEnd(css, cursor);
        continue;
      }
      const isAtRule = first === AT_SIGN;
      let stop = isAtRule ? -1 : this.__findFlatPreludeEnd__(cursor);
      if (stop === -1) {
        stop = this.__findStructure__(cursor, isAtRule);
        if (stop >= length) {
          if (isAtRule) result += css.slice(cursor).trim();
          this.__end__ = -1;
          return result;
        }
        const stopCode = css.charCodeAt(stop);
        if (stopCode === SEMICOLON) {
          result += css.slice(cursor, stop + 1);
          cursor = stop + 1;
          continue;
        }
        if (stopCode === RBRACE) {
          if (isNested) {
            this.__end__ = stop + 1;
            return result;
          }
          cursor = stop + 1;
          continue;
        }
        if (isAtRule) {
          const prelude = css.slice(cursor, stop).trim();
          if (GROUPING_AT_RULE.test(prelude)) {
            const inner = this.__scopeRuleList__(stop + 1, true);
            if (this.__end__ === -1) return result;
            result += prelude + '{' + inner + '}';
            cursor = this.__end__;
            continue;
          }
          const close = this.__findBlockEnd__(stop);
          if (close === -1) {
            this.__end__ = -1;
            return result;
          }
          result += prelude + css.slice(stop, close + 1);
          cursor = close + 1;
          continue;
        }
      }
      const close = this.__findStyleBlockEnd__(stop);
      if (close === -1) {
        this.__end__ = -1;
        return result;
      }
      result += this.__scopeStyleRule__(cursor, stop, close);
      cursor = close + 1;
    }
  }

  /**
   * Finds the `{` of a style rule whose prelude holds no `}` and no opaque token,
   * refreshing the `{`, `}` and opaque caches from `cursor`.
   *
   * @returns The index of that `{`, or `-1` when the prelude needs `__findStructure__`.
   */
  private __findFlatPreludeEnd__(cursor: number): number {
    const css = this.__css__;
    let open = this.__open__;
    if (open < cursor) {
      open = css.indexOf('{', cursor);
      this.__open__ = open = open === -1 ? css.length : open;
    }
    let close = this.__close__;
    if (close < cursor) {
      close = css.indexOf('}', cursor);
      this.__close__ = close = close === -1 ? css.length : close;
    }
    const opaque =
      this.__opaque__ >= cursor
        ? this.__opaque__
        : this.__findOpaqueStart__(cursor, open < close ? open : close);
    return open < close && open < opaque ? open : -1;
  }

  /**
   * Finds the `}` that closes the style block opening at `open`. The `}` and opaque
   * caches already point past `open`, so a block with no `{` and no opaque token
   * before its first `}` ends there; any other block is walked by depth.
   *
   * @returns The index of the closing `}`, or `-1` when the block never closes.
   */
  private __findStyleBlockEnd__(open: number): number {
    const css = this.__css__;
    let nextOpen = css.indexOf('{', open + 1);
    this.__open__ = nextOpen = nextOpen === -1 ? css.length : nextOpen;
    const close = this.__close__;
    return close < nextOpen && close < this.__opaque__
      ? close
      : this.__findBlockEnd__(open);
  }

  /**
   * Prefixes the style rule whose prelude is `css[cursor, open)` and whose block
   * ends at `close`.
   *
   * @returns The scoped rule, or `''` when the prelude is empty. A single selector
   * that starts and ends with an ASCII non-space character other than a leading
   * `:` is already trimmed, cannot be `:root` or `:host`, and touches its block, so
   * it is emitted as one slice behind the prefix.
   */
  private __scopeStyleRule__(
    cursor: number,
    open: number,
    close: number,
  ): string {
    const css = this.__css__;
    let comma = this.__comma__;
    if (comma < cursor) {
      comma = css.indexOf(',', cursor);
      this.__comma__ = comma = comma === -1 ? css.length : comma;
    }
    if (comma < open)
      return (
        prefixSelectorList(css, cursor, open, this.__prefix__) +
        css.slice(open, close + 1)
      );
    const first = css.charCodeAt(cursor);
    const last = css.charCodeAt(open - 1);
    if (
      open > cursor &&
      first !== COLON &&
      first < NON_ASCII_MIN &&
      last > WHITESPACE_MAX &&
      last < NON_ASCII_MIN
    )
      return this.__prefix__ + css.slice(cursor, close + 1);
    const selector = trimSelector(css.slice(cursor, open));
    return selector
      ? prefixSelector(selector, this.__prefix__) + css.slice(open, close + 1)
      : '';
  }

  /** Finds the `}` matching the `{` at `open`, or `-1` when the block never closes. */
  private __findBlockEnd__(open: number): number {
    const length = this.__css__.length;
    let depth = 0;
    let position = open + 1;
    for (;;) {
      const token = this.__findStructure__(position, false);
      if (token >= length) return -1;
      if (token === this.__open__) depth++;
      else if (depth-- === 0) return token;
      position = token + 1;
    }
  }

  /**
   * Finds the first `{` or `}` (or `;` when `isStatementEnd`) at or after `from`
   * outside every opaque token, or the text length when there is none.
   */
  private __findStructure__(from: number, isStatementEnd: boolean): number {
    const css = this.__css__;
    const length = css.length;
    for (;;) {
      let open = this.__open__;
      if (open < from) {
        open = css.indexOf('{', from);
        this.__open__ = open = open === -1 ? length : open;
      }
      let close = this.__close__;
      if (close < from) {
        close = css.indexOf('}', from);
        this.__close__ = close = close === -1 ? length : close;
      }
      let stop = open < close ? open : close;
      if (isStatementEnd) {
        let semicolon = this.__semicolon__;
        if (semicolon < from) {
          semicolon = css.indexOf(';', from);
          this.__semicolon__ = semicolon =
            semicolon === -1 ? length : semicolon;
        }
        if (semicolon < stop) stop = semicolon;
      }
      const opaque =
        this.__opaque__ >= from
          ? this.__opaque__
          : this.__findOpaqueStart__(from, stop);
      if (opaque >= stop) return stop;
      from = getCssOpaqueEnd(css, opaque);
    }
  }

  /**
   * Refreshes the first opaque opening after `from` through the shared position model.
   * Plain components are skipped only when they end before the native structure candidate.
   */
  private __findOpaqueStart__(from: number, stop: number): number {
    OPAQUE_START.lastIndex = from;
    const index = OPAQUE_START.test(this.__css__)
      ? OPAQUE_START.lastIndex - 1
      : this.__css__.length;
    return (this.__opaque__ =
      index < this.__css__.length
        ? resolveCssOpaqueCandidate(this.__css__, index, stop)
        : index);
  }
}
