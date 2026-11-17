import { LBRACE, RBRACE } from '../constants/charCode';
import { skipOpaqueToken } from './skipOpaqueToken';

/**
 * Finds the `}` that closes the block opened at `open`, counting nested blocks
 * and skipping strings, comments, escapes and unquoted `url(…)`. The slow path
 * of `RuleScoper`, taken only when such a token may sit inside the block.
 *
 * @param css - Stylesheet text
 * @param open - Index of the block's `{`
 * @returns Index of the matching `}`, or `-1` when the block never closes.
 */
export const findBlockEnd = (css: string, open: number): number => {
  const length = css.length;
  let depth = 0;
  for (let index = open + 1; index < length; ) {
    const next = skipOpaqueToken(css, index);
    if (next !== index) {
      index = next;
      continue;
    }
    const code = css.charCodeAt(index);
    if (code === LBRACE) depth++;
    else if (code === RBRACE && depth-- === 0) return index;
    index++;
  }
  return -1;
};
