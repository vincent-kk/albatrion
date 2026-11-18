/**
 * Trims separator whitespace without removing a final escaped whitespace token.
 * @param selector - One raw selector
 * @returns The selector with only unescaped surrounding whitespace removed
 */
export const trimSelector = (selector: string): string => {
  const trimmed = selector.trim();
  if (!trimmed.endsWith('\\')) return trimmed;
  let backslashes = 0;
  for (
    let index = trimmed.length - 1;
    index >= 0 && trimmed[index] === '\\';
    index--
  )
    backslashes++;
  return backslashes % 2 !== 0
    ? trimmed + selector.charAt(selector.indexOf(trimmed) + trimmed.length)
    : trimmed;
};
