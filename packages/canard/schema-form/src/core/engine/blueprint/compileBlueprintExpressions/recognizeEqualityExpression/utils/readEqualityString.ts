import type { Dictionary, Optional } from '@aileron/declare';

import type { EqualityLiteralRead } from './types';

/** Allowed single-character escapes; unknown identity escapes are rejected. */
const SIMPLE_ESCAPES: Readonly<Dictionary<string>> = {
  '\\': '\\',
  "'": "'",
  '"': '"',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
  v: '\v',
};

/**
 * Decode a quoted literal without invoking the JavaScript compiler or evaluator.
 * @param source - Substituted expression whose quote starts at start
 * @param start - Index of a single or double quote
 * @returns Decoded value and next cursor, or undefined for unsupported escapes
 */
export const readEqualityString = (
  source: string,
  start: number,
): Optional<EqualityLiteralRead> => {
  const quote = source[start];
  let value = '';
  let index = start + 1;
  while (index < source.length) {
    const character = source[index++];
    if (character === quote) return { value, end: index };
    if (
      character === '\n' ||
      character === '\r' ||
      character === '\u2028' ||
      character === '\u2029'
    )
      return;
    if (character !== '\\') {
      value += character;
      continue;
    }
    const escape = source[index++];
    const simple = SIMPLE_ESCAPES[escape];
    if (simple !== undefined) {
      value += simple;
      continue;
    }
    if (escape === '0') {
      if (source[index] >= '0' && source[index] <= '9') return;
      value += '\0';
      continue;
    }
    if (escape !== 'x' && escape !== 'u') return;
    const braced = escape === 'u' && source[index] === '{';
    const length = escape === 'x' ? 2 : 4;
    if (braced) index++;
    let code = 0;
    let digits = 0;
    while (
      index < source.length &&
      (braced ? source[index] !== '}' : digits < length)
    ) {
      const character = source[index++].toLowerCase();
      const digit = '0123456789abcdef'.indexOf(character);
      if (digit < 0) return;
      code = code * 16 + digit;
      if (code > 0x10ffff) return;
      digits++;
    }
    if (braced) {
      if (digits === 0 || source[index++] !== '}') return;
      value += String.fromCodePoint(code);
    } else {
      if (digits !== length) return;
      value += String.fromCharCode(code);
    }
  }
  return undefined;
};
