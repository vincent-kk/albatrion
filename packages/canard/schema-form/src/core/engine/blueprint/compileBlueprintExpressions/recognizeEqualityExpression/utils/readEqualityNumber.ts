import type { EqualityLiteralRead } from './types';

/**
 * Decode the admitted finite numeric grammar, keeping unary minus separate.
 * @param source - Substituted expression starting with a digit, dot or unary minus
 * @param start - First source character of the numeric primary
 * @returns Finite numeric value and exclusive cursor, or undefined on invalid syntax
 */
export const readEqualityNumber = (
  source: string,
  start: number,
): EqualityLiteralRead | undefined => {
  let index = start;
  const negative = source[index] === '-';
  if (negative) {
    index++;
    while (index < source.length && source[index].trim() === '') index++;
  }
  const numberStart = index;
  const prefix = source[index + 1]?.toLowerCase();
  if (
    source[index] === '0' &&
    (prefix === 'x' || prefix === 'o' || prefix === 'b')
  ) {
    const digits =
      prefix === 'x' ? '0123456789abcdef' : prefix === 'o' ? '01234567' : '01';
    index += 2;
    const digitStart = index;
    while (
      index < source.length &&
      digits.includes(source[index].toLowerCase())
    )
      index++;
    if (index === digitStart) return;
  } else {
    if (source[index] === '0') {
      index++;
      if (source[index] >= '0' && source[index] <= '9') return;
    } else {
      while (source[index] >= '0' && source[index] <= '9') index++;
    }
    const integerEnd = index;
    if (source[index] === '.') {
      index++;
      const decimalStart = index;
      while (source[index] >= '0' && source[index] <= '9') index++;
      if (integerEnd === numberStart && decimalStart === index) return;
    } else if (integerEnd === numberStart) return;
    if (source[index] === 'e' || source[index] === 'E') {
      index++;
      if (source[index] === '+' || source[index] === '-') index++;
      const exponentStart = index;
      while (source[index] >= '0' && source[index] <= '9') index++;
      if (exponentStart === index) return;
    }
  }
  const number = Number(source.slice(numberStart, index));
  if (!Number.isFinite(number)) return;
  return { value: negative ? -number : number, end: index };
};
