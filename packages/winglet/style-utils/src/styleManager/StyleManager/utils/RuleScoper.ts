import { createCssPunctuationProbe } from '../../../utils/cssTokens/createCssPunctuationProbe';
import { findCssPunctuation } from '../../../utils/cssTokens/findCssPunctuation';
import { getCssComponentEnd } from '../../../utils/cssTokens/getCssComponentEnd';
import { getCssOpaqueEnd } from '../../../utils/cssTokens/getCssOpaqueEnd';
import { getSimpleRuleEnd } from '../../../utils/cssTokens/getSimpleRuleEnd';
import { getVerbatimRuleEnd } from '../../../utils/cssTokens/getVerbatimRuleEnd';
import { isVerbatimRuleStart } from '../../../utils/cssTokens/isVerbatimRuleStart';
import {
  ASTERISK,
  AT_SIGN,
  COLON,
  COMMA,
  LBRACE,
  NON_ASCII_MIN,
  RBRACE,
  SEMICOLON,
  SLASH,
  WHITESPACE_MAX,
} from '../constants/charCode';
import { prefixSelector } from './prefixSelector';
import { findSelectorStop } from './RuleScoper/findSelectorStop';
import { getFlatBlockEnd } from './RuleScoper/getFlatBlockEnd';
import { getFlatSelectorEnd } from './RuleScoper/getFlatSelectorEnd';
import { trimSelector } from './trimSelector';

/** CSS whitespace (tab, LF, FF, CR, space), the only text the sheet preparation skips between flat rules. */
const isCssWhitespace = (code: number): boolean =>
  code === 32 || code === 10 || code === 9 || code === 13 || code === 12;

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
   * Scopes the stylesheet in one pass when the uncompressed document preparation
   * would return it unchanged, proving that on the way.
   *
   * The proof holds when the text does not start with U+FEFF and consists of CSS
   * whitespace and top-level rules that the preparation skips whole: a style rule
   * whose selector stops come from the flat selector search and whose block is a
   * flat block (together the flat style rule), or an at-rule accepted by
   * `getVerbatimRuleEnd` that the scoper also ends at that rule's end. Every read is
   * one `scopeSheet` performs on the same text, so the result equals `scopeSheet`.
   *
   * @returns The scoped stylesheet, or `null` at the first position outside that
   * shape; the partial result is discarded and the caller prepares and scopes in two passes.
   */
  scopeFlatSheet(): string | null {
    const css = this.__css__;
    const length = css.length;
    if (css.charCodeAt(0) === 0xfeff) return null;
    let result = '';
    let cursor = 0;
    for (;;) {
      while (cursor < length && isCssWhitespace(css.charCodeAt(cursor)))
        cursor++;
      if (cursor >= length) return result;
      if (!isVerbatimRuleStart(css, cursor)) return null;
      if (css.charCodeAt(cursor) === AT_SIGN) {
        const end = getVerbatimRuleEnd(css, cursor);
        if (end === 0) return null;
        const stop = findCssPunctuation(css, cursor, AT_RULE_PUNCTUATION);
        if (css.charCodeAt(stop) !== LBRACE) return null;
        const prelude = css.slice(cursor, stop).trim();
        if (GROUPING_AT_RULE.test(prelude)) {
          const inner = this.__scopeRuleList__(stop + 1, true);
          if (this.__end__ !== end) return null;
          result += prelude + '{' + inner + '}';
        } else {
          if (getCssComponentEnd(css, stop, 0) !== end) return null;
          result += prelude + css.slice(stop, end);
        }
        cursor = end;
        continue;
      }
      let selectorStart = cursor;
      let selectors = '';
      let stop = getFlatSelectorEnd(css, cursor);
      let stopCode = css.charCodeAt(stop);
      while (stopCode === COMMA) {
        selectors +=
          prefixSelector(
            trimSelector(css.slice(selectorStart, stop)),
            this.__prefix__,
          ) + ',';
        selectorStart = stop + 1;
        stop = getFlatSelectorEnd(css, selectorStart);
        stopCode = css.charCodeAt(stop);
      }
      if (stopCode !== LBRACE) return null;
      const end = getFlatBlockEnd(css, stop);
      if (end === 0) return null;
      result +=
        selectors +
        this.__scopeStyleRule__(selectorStart, stop, end, selectors.length > 0);
      cursor = end;
    }
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
      let stop = isAtRule
        ? findCssPunctuation(css, cursor, AT_RULE_PUNCTUATION)
        : findSelectorStop(css, cursor, STYLE_PUNCTUATION);
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
        stop = findSelectorStop(css, selectorStart, STYLE_PUNCTUATION);
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
