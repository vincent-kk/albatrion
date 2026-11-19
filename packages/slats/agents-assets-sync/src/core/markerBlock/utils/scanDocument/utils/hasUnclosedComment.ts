/** Read comment delimiters without treating nested comment text as markup.
 * @param line Text outside a fenced code block.
 * @returns Whether the last opening comment continues onto the next line.
 */
export function hasUnclosedComment(line: string): boolean {
  let offset = 0;
  while (offset < line.length) {
    const open = line.indexOf('<!--', offset);
    if (open < 0) return false;
    const close = line.indexOf('-->', open + 4);
    if (close < 0) return true;
    offset = close + 3;
  }
  return false;
}
