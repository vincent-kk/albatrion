/**
 * Replace a canonical prefix of an address and keep its encoded remainder.
 * @param path - Canonical address that already starts with previousPath; the prefix is not verified.
 * @param previousPath - The prefix of path to drop.
 * @param nextPath - The replacement prefix.
 * @returns nextPath followed by the unchanged remainder of path.
 */
export const rebasePointer = (
  path: string,
  previousPath: string,
  nextPath: string,
): string => nextPath + path.slice(previousPath.length);
