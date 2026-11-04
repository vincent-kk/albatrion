import { JSONPointer as $ } from '../constants/JSONPointer';
import { PointerOperator } from '../constants/PointerOperator';

/**
 * Detect an operator segment without splitting the address.
 * @param path - Canonical address, searched at segment boundaries only.
 * @param operator - One of the four PointerOperator symbols.
 * @returns True when a segment is exactly that operator's raw token. The percent spelling of a literal name never matches.
 */
export const hasPointerOperator = (
  path: string,
  operator: PointerOperator,
): boolean => {
  const token =
    operator === PointerOperator.Wildcard
      ? $.Wildcard
      : operator === PointerOperator.Parent
        ? $.Parent
        : operator === PointerOperator.Current
          ? $.Current
          : operator === PointerOperator.Context
            ? $.Context
            : undefined;
  if (token === undefined) return false;
  let start = path.indexOf(token);
  while (start >= 0) {
    const end = start + token.length;
    if (
      (start === 0 || path[start - 1] === $.Separator) &&
      (end === path.length || path[end] === $.Separator)
    )
      return true;
    start = path.indexOf(token, end);
  }
  return false;
};
