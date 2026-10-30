import type { Optional } from '@aileron/declare';

import type { EqualityToken, EqualityTree } from './types';

/**
 * Build an iterative precedence tree: equality binds more tightly than logical OR.
 * @param tokens - Closed scanner output, including explicit parentheses
 * @returns One complete tree or undefined for malformed operand/operator order
 */
export const parseEqualityTree = (
  tokens: readonly EqualityToken[],
): Optional<EqualityTree> => {
  const values: EqualityTree[] = [];
  const operators: ('===' | '||' | '(')[] = [];
  let expectsPrimary = true;
  for (const token of tokens) {
    if (token.kind === 'reference' || token.kind === 'literal') {
      if (!expectsPrimary) return;
      values.push(token);
      expectsPrimary = false;
    } else if (token.kind === '(') {
      if (!expectsPrimary) return;
      operators.push('(');
    } else {
      if (expectsPrimary) return;
      while (
        operators.length &&
        operators[operators.length - 1] !== '(' &&
        (token.kind === ')' ||
          token.kind === '||' ||
          operators[operators.length - 1] === '===')
      ) {
        const operator = operators.pop()!;
        const right = values.pop();
        const left = values.pop();
        if (!left || !right || operator === '(') return;
        values.push({ kind: operator, left, right });
      }
      if (token.kind === ')') {
        if (operators.pop() !== '(') return;
      } else {
        operators.push(token.kind);
        expectsPrimary = true;
      }
    }
  }
  if (expectsPrimary) return;
  while (operators.length) {
    const operator = operators.pop()!;
    const right = values.pop();
    const left = values.pop();
    if (operator === '(' || !left || !right) return;
    values.push({ kind: operator, left, right });
  }
  return values.length === 1 ? values[0] : undefined;
};
