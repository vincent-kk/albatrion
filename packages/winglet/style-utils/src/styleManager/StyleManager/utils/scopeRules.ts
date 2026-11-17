import { findBlockEnd } from './findBlockEnd';
import { prefixSelector } from './prefixSelector';
import { prefixSelectorList } from './prefixSelectorList';

/**
 * At-rules whose block holds style rules, which are scoped recursively.
 * Every other block at-rule (`@keyframes`, `@font-face`, `@page`, …) is copied as is.
 */
const GROUPING_AT_RULE =
  /^@(?:-[a-z]+-)?(?:media|supports|container|layer|document|starting-style)(?![\w-])/i;

/**
 * Prefixes every style rule in `css[start, end)` with the scope class.
 *
 * @param css - Stylesheet text
 * @param start - Index where the rule list begins
 * @param end - Index just past the rule list (the enclosing block's `}` or the text's end)
 * @param scope - Scope selector to prefix, such as `.my-widget`
 * @returns The scoped rules. Statement at-rules (`@import …;`) and non-grouping
 * block at-rules are copied unchanged, grouping at-rules (`@media`, …) keep
 * their prelude and have their inner rules scoped, and a trailing rule without
 * a matching `}` is dropped.
 */
export const scopeRules = (
  css: string,
  start: number,
  end: number,
  scope: string,
): string => {
  let result = '';
  let cursor = start;
  let open = css.indexOf('{', cursor);
  let comma = -1;
  while (open !== -1 && open < end) {
    const prelude = css.slice(cursor, open).trim();
    if (prelude[0] === '@') {
      const statementEnd = css.indexOf(';', cursor);
      if (statementEnd !== -1 && statementEnd < open) {
        result += css.slice(cursor, statementEnd + 1).trim();
        cursor = statementEnd + 1;
        continue;
      }
    }
    const nextOpen = css.indexOf('{', open + 1);
    const close = findBlockEnd(css, open, nextOpen);
    if (close === -1 || close >= end) break;
    if (prelude[0] === '@')
      result += GROUPING_AT_RULE.test(prelude)
        ? prelude + '{' + scopeRules(css, open + 1, close, scope) + '}'
        : prelude + css.slice(open, close + 1);
    else if (prelude) {
      // One search over the whole text, reused until the cursor passes it, is cheaper than one per selector.
      if (comma < cursor) {
        comma = css.indexOf(',', cursor);
        if (comma === -1) comma = css.length;
      }
      result +=
        (comma < open
          ? prefixSelectorList(prelude, scope)
          : prefixSelector(prelude, scope)) + css.slice(open, close + 1);
    }
    cursor = close + 1;
    // A flat block's first inner `{` search already found the next rule's `{`.
    open = nextOpen > close ? nextOpen : css.indexOf('{', cursor);
  }
  return result;
};
