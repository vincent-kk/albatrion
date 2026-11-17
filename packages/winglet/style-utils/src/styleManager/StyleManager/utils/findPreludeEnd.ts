import { LBRACE, RBRACE, SEMICOLON } from '../constants/charCode';
import { skipOpaqueToken } from './skipOpaqueToken';

/**
 * Finds where a rule's prelude ends, character by character, skipping strings,
 * comments, escapes and unquoted `url(…)`. The slow path of `RuleScoper`, taken
 * only when such a token may sit inside the prelude.
 *
 * @param css - Stylesheet text
 * @param from - Index where the prelude starts
 * @param isAtRule - Whether a `;` also ends the prelude (an at-rule statement)
 * @returns Index of the first structural `{` or `}` (or `;` for an at-rule), or
 * `css.length` when there is none.
 */
export const findPreludeEnd = (
  css: string,
  from: number,
  isAtRule: boolean,
): number => {
  const length = css.length;
  for (let index = from; index < length; ) {
    const next = skipOpaqueToken(css, index);
    if (next !== index) {
      index = next;
      continue;
    }
    const code = css.charCodeAt(index);
    if (code === LBRACE || code === RBRACE || (isAtRule && code === SEMICOLON))
      return index;
    index++;
  }
  return length;
};
