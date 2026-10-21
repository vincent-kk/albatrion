import { readEqualityNumber } from './readEqualityNumber';
import { readEqualityString } from './readEqualityString';
import type { EqualityToken } from './types';

/**
 * Scan every character of the substituted expression using a closed token set.
 * @param source - Compiler-identical dependency-array expression
 * @returns Tokens or undefined if any character cannot participate in the grammar
 */
export const scanEqualityTokens = (
  source: string,
): EqualityToken[] | undefined => {
  const tokens: EqualityToken[] = [];
  let index = 0;
  while (index < source.length) {
    const character = source[index];
    if (character.trim() === '') {
      index++;
      continue;
    }
    if (source.startsWith('dependencies[0]', index)) {
      index += 15;
      if (
        source[index] === '.' ||
        source[index] === '[' ||
        source[index] === '('
      )
        return;
      tokens.push({ kind: 'reference' });
    } else if (source.startsWith('===', index)) {
      tokens.push({ kind: '===' });
      index += 3;
    } else if (source.startsWith('||', index)) {
      tokens.push({ kind: '||' });
      index += 2;
    } else if (character === '(' || character === ')') {
      tokens.push({ kind: character });
      index++;
    } else if (character === "'" || character === '"') {
      const literal = readEqualityString(source, index);
      if (!literal) return;
      tokens.push({ kind: 'literal', value: literal.value });
      index = literal.end;
    } else if (
      character === '-' ||
      character === '.' ||
      (character >= '0' && character <= '9')
    ) {
      const literal = readEqualityNumber(source, index);
      if (!literal) return;
      tokens.push({ kind: 'literal', value: literal.value });
      index = literal.end;
    } else if (source.startsWith('true', index)) {
      tokens.push({ kind: 'literal', value: true });
      index += 4;
    } else if (source.startsWith('false', index)) {
      tokens.push({ kind: 'literal', value: false });
      index += 5;
    } else if (source.startsWith('null', index)) {
      tokens.push({ kind: 'literal', value: null });
      index += 4;
    } else return;
  }
  return tokens;
};
