import { PointerOperator } from '../constants/PointerOperator';

/** Check operator identity at segment boundaries without a split array or token substrings. */
export const hasPointerOperator = (
  path: string,
  operator: PointerOperator,
): boolean => {
  const token =
    operator === PointerOperator.Wildcard
      ? '*'
      : operator === PointerOperator.Parent
        ? '..'
        : operator === PointerOperator.Current
          ? '.'
          : operator === PointerOperator.Context
            ? '@'
            : undefined;
  if (token === undefined) return false;
  let start = path.indexOf(token);
  while (start >= 0) {
    const end = start + token.length;
    if (
      (start === 0 || path[start - 1] === '/') &&
      (end === path.length || path[end] === '/')
    )
      return true;
    start = path.indexOf(token, end);
  }
  return false;
};
