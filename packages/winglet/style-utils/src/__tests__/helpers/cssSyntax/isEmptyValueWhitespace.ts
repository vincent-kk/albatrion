import { type ComponentValue, isTokenNode, isWhitespaceNode } from '@csstools/css-parser-algorithms';

/** Identify whitespace that supplies the entire value after a declaration or query colon. */
export const isEmptyValueWhitespace = (values: ComponentValue[], index: number): boolean => {
  let before = index - 1, after = index + 1;
  while (before >= 0 && isWhitespaceNode(values[before])) before--;
  while (after < values.length && isWhitespaceNode(values[after])) after++;
  const previous = values[before], next = values[after];
  return previous !== undefined && isTokenNode(previous) && previous.value[0] === 'colon-token' && (next === undefined || (isTokenNode(next) && next.value[0] === 'semicolon-token'));
};
