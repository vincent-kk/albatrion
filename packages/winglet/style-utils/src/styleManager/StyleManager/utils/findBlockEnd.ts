/**
 * Finds the `}` that closes the block opened at `open`, counting nested blocks.
 *
 * @param css - Stylesheet text
 * @param open - Index of the block's `{`
 * @returns Index of the matching `}`, or `-1` when the block never closes.
 */
export const findBlockEnd = (css: string, open: number): number => {
  const close = css.indexOf('}', open + 1);
  if (close === -1 || css.lastIndexOf('{', close) === open) return close;
  let depth = 0;
  for (let index = open + 1, length = css.length; index < length; index++) {
    const char = css[index];
    if (char === '{') depth++;
    else if (char === '}' && depth-- === 0) return index;
  }
  return -1;
};
