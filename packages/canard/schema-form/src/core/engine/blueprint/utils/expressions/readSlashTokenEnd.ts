import { JSON_POINTER_PATH_STICKY_REGEX } from './regex';

/** Flags a regular expression literal may carry. */
const REGEXP_FLAGS = 'dgimsuyv';

/** Whitespace between a literal and the token after it. */
const WHITESPACE = /\s/;

/** A character that opens an operand, so the slash before it divides a path. */
const OPERAND_START = /[\w$("'`#@[{!~/]/;

/**
 * Find the end of a comment or regular expression literal that opens at a slash.
 * @param expression - Authored expression text
 * @param index - Position of a `/` in code
 * @param isAfterValue - True when the slash follows a value, so it can only divide or open a comment
 * @returns End offset (exclusive) of the comment or literal; -1 for division or a path
 */
export const readSlashTokenEnd = (
  expression: string,
  index: number,
  isAfterValue: boolean,
): number => {
  const next = expression[index + 1];
  if (next === '/') {
    const end = expression.indexOf('\n', index);
    return end < 0 ? expression.length : end;
  }
  if (next === '*') {
    const end = expression.indexOf('*/', index + 2);
    return end < 0 ? expression.length : end + 2;
  }
  if (isAfterValue) return -1;
  let close = index + 1;
  let isInClass = false;
  let hasRegexSyntax = false;
  for (; close < expression.length; close++) {
    const char = expression[close];
    if (char === '\n') return -1;
    if (char === '\\') {
      hasRegexSyntax = true;
      close++;
    } else if (char === '[') {
      hasRegexSyntax = true;
      isInClass = true;
    } else if (char === ']') isInClass = false;
    else if (char === '/' && !isInClass) break;
  }
  if (close >= expression.length) return -1;
  let end = close + 1;
  while (end < expression.length && REGEXP_FLAGS.includes(expression[end]))
    end++;
  let after = end;
  while (after < expression.length && WHITESPACE.test(expression[after]))
    after++;
  if (after < expression.length && OPERAND_START.test(expression[after]))
    return -1;
  // Character classes and escapes make the body a regex; other absolute spellings keep path priority.
  if (hasRegexSyntax) return end;
  JSON_POINTER_PATH_STICKY_REGEX.lastIndex = index;
  const path = JSON_POINTER_PATH_STICKY_REGEX.exec(expression);
  if (
    path === null ||
    index + path[0].length === close
  )
    return end;
  return -1;
};
