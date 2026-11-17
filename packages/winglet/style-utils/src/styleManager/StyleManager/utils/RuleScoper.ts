import {
  ASTERISK,
  AT_SIGN,
  RBRACE,
  SEMICOLON,
  SLASH,
  WHITESPACE_MAX,
} from '../constants/charCode';
import { findUnquotedUrlEnd } from './findUnquotedUrlEnd';
import { prefixSelector } from './prefixSelector';
import { prefixSelectorList } from './prefixSelectorList';
import { skipOpaqueToken } from './skipOpaqueToken';

/**
 * At-rules whose block holds style rules, which are scoped recursively.
 * Every other block at-rule (`@keyframes`, `@font-face`, `@page`, …) is copied as is.
 */
const GROUPING_AT_RULE =
  /^@(?:-[a-z]+-)?(?:media|supports|container|layer|scope|document|starting-style)(?![\w-])/i;

/** Start of a quoted string, a comment or a backslash escape; `lastIndex` sets where the search starts. */
const OPAQUE_START = /["'\\]|\/\*/g;

/**
 * Prefixes every style rule of one stylesheet with a scope selector, in one forward pass.
 *
 * Structural characters (`{`, `}`, `;`, `,`) and the starts of opaque tokens
 * (quotes, `/*`, backslashes) are located with native `indexOf` searches
 * whose results are cached until the cursor passes them. When an opaque token
 * comes before the next structural character, only that token is skipped and
 * the search resumes, so braces, semicolons and commas inside strings, comments,
 * escapes never count as structure; a `/*` inside an unquoted `url(…)` opens no
 * comment either. The caches stay valid because every query moves forward.
 * Known limit: a brace inside an unquoted `url(…)` still counts as structure.
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
        cursor = skipOpaqueToken(css, cursor);
        continue;
      }
      const isAtRule = first === AT_SIGN;
      const stop = this.__findStructure__(cursor, isAtRule);
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
      const prelude = css.slice(cursor, stop).trim();
      if (isAtRule && GROUPING_AT_RULE.test(prelude)) {
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
      if (isAtRule) result += prelude + css.slice(stop, close + 1);
      else if (prelude) {
        let comma = this.__comma__;
        if (comma < cursor) {
          comma = css.indexOf(',', cursor);
          this.__comma__ = comma = comma === -1 ? length : comma;
        }
        result +=
          (comma < stop
            ? prefixSelectorList(css, cursor, stop, this.__prefix__)
            : prefixSelector(prelude, this.__prefix__)) +
          css.slice(stop, close + 1);
      }
      cursor = close + 1;
    }
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
      const segmentStart = from;
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
          : this.__findOpaqueStart__(from);
      if (opaque >= stop) return stop;
      from =
        css.charCodeAt(opaque) === SLASH
          ? skipCommentOrUrl(css, segmentStart, opaque)
          : skipOpaqueToken(css, opaque);
    }
  }

  /**
   * Refreshes the cached start of the first quote, comment or backslash escape at
   * or after `from`, and returns it. One regular-expression search costs one call
   * however many kinds of token it looks for; four `indexOf` searches cost four.
   */
  private __findOpaqueStart__(from: number): number {
    OPAQUE_START.lastIndex = from;
    const match = OPAQUE_START.exec(this.__css__);
    return (this.__opaque__ =
      match === null ? this.__css__.length : match.index);
  }
}

/**
 * Skips the comment that opens at `comment`, unless an unquoted `url(` that began
 * in the plain segment before it still runs past it; then the whole `url(…)` is
 * skipped, since a `/*` inside it opens no comment.
 */
const skipCommentOrUrl = (
  css: string,
  segmentStart: number,
  comment: number,
): number => {
  const url = css.slice(segmentStart, comment).lastIndexOf('url(');
  const urlEnd =
    url === -1 ? -1 : findUnquotedUrlEnd(css, segmentStart + url + 3);
  return urlEnd > comment ? urlEnd : skipOpaqueToken(css, comment);
};
