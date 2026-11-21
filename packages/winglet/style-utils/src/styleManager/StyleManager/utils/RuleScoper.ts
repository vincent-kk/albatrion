import { createCssPunctuationProbe } from '../../../utils/cssTokens/createCssPunctuationProbe';
import { findCssPunctuation } from '../../../utils/cssTokens/findCssPunctuation';
import { getCssComponentEnd } from '../../../utils/cssTokens/getCssComponentEnd';
import { getCssOpaqueEnd } from '../../../utils/cssTokens/getCssOpaqueEnd';
import { getSimpleRuleEnd } from '../../../utils/cssTokens/getSimpleRuleEnd';
import {
  ASTERISK,
  AT_SIGN,
  COLON,
  COMMA,
  NON_ASCII_MIN,
  RBRACE,
  SEMICOLON,
  SLASH,
  WHITESPACE_MAX,
} from '../constants/charCode';
import { prefixSelector } from './prefixSelector';
import { trimSelector } from './trimSelector';

/**
 * At-rules whose block holds style rules, which are scoped recursively.
 * Every other block at-rule (`@keyframes`, `@font-face`, `@page`, …) is copied as is.
 */
const GROUPING_AT_RULE =
  /^@(?:-[a-z]+-)?(?:media|supports|container|layer|scope|document|starting-style)(?![\w-])/i;

/** Commas separate complete selectors before the block opens. */
const STYLE_PUNCTUATION = createCssPunctuationProbe('{},');
/** A semicolon may terminate an at-rule prelude. */
const AT_RULE_PUNCTUATION = createCssPunctuationProbe('{};');

/**
 * Prefixes every style rule of one stylesheet with a scope selector, in one forward pass.
 *
 * One native delimiter search finds plain CSS positions. The common token
 * reader consumes opaque tokens and components wherever they occur.
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
    const css = this.__css__;
    if (css.length && getSimpleRuleEnd(css, 0) === css.length)
      return this.__prefix__ + css;
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
      if (first === SLASH && css.charCodeAt(cursor + 1) === ASTERISK) {
        cursor = getCssOpaqueEnd(css, cursor);
        continue;
      }
      const isAtRule = first === AT_SIGN;
      let stop = findCssPunctuation(
        css,
        cursor,
        isAtRule ? AT_RULE_PUNCTUATION : STYLE_PUNCTUATION,
      );
      let stopCode = css.charCodeAt(stop);
      let selectorStart = cursor;
      let selectors = '';
      while (stopCode === COMMA) {
        selectors +=
          prefixSelector(
            trimSelector(css.slice(selectorStart, stop)),
            this.__prefix__,
          ) + ',';
        selectorStart = stop + 1;
        stop = findCssPunctuation(css, selectorStart, STYLE_PUNCTUATION);
        stopCode = css.charCodeAt(stop);
      }
      if (stop === length) {
        if (isAtRule) result += css.slice(cursor).trim();
        this.__end__ = -1;
        return result;
      }
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
      }
      const end = getCssComponentEnd(css, stop, 0);
      if (end === 0) {
        this.__end__ = -1;
        return result;
      }
      result += isAtRule
        ? css.slice(cursor, stop).trim() + css.slice(stop, end)
        : selectors +
          this.__scopeStyleRule__(
            selectorStart,
            stop,
            end,
            selectors.length > 0,
          );
      cursor = end;
    }
  }

  /**
   * Prefixes the style rule whose prelude is `css[cursor, open)` and whose block
   * ends immediately before `end`.
   *
   * @returns The scoped rule, or `''` when the prelude is empty. A single selector
   * that starts and ends with an ASCII non-space character other than a leading
   * `:` is already trimmed, cannot be `:root` or `:host`, and touches its block, so
   * it is emitted as one slice behind the prefix.
   */
  private __scopeStyleRule__(
    cursor: number,
    open: number,
    end: number,
    hasList: boolean,
  ): string {
    const css = this.__css__;
    const first = css.charCodeAt(cursor);
    const last = css.charCodeAt(open - 1);
    if (
      open > cursor &&
      first !== COLON &&
      first !== SLASH &&
      first > WHITESPACE_MAX &&
      first < NON_ASCII_MIN &&
      last > WHITESPACE_MAX &&
      last < NON_ASCII_MIN
    )
      return this.__prefix__ + css.slice(cursor, end);
    const selector = trimSelector(css.slice(cursor, open));
    return selector || hasList
      ? prefixSelector(selector, this.__prefix__) + css.slice(open, end)
      : '';
  }
}
