import { readSlashTokenEnd } from './readSlashTokenEnd';
import { JSON_POINTER_PATH_STICKY_REGEX } from './regex';

/** A character that ends a value, so a following slash divides. */
const VALUE_END = /[\w$)\]}]/;

/** Whitespace keeps the previous token's value state. */
const WHITESPACE = /\s/;

/**
 * Replace paths in code only, skipping strings, template text, comments and regular expression literals.
 * @param expression - Authored expression text
 * @param replace - Called once per code path in source order; its result replaces the path
 * @returns The expression with code paths replaced; non-code text is copied unchanged
 */
export const replaceScannedExpressionPaths = (
  expression: string,
  replace: (path: string) => string,
): string => {
  const braces: number[] = [];
  let output = '';
  let copied = 0;
  let quote = '';
  let isAfterValue = false;
  for (let index = 0; index < expression.length; index++) {
    const char = expression[index];
    if (quote) {
      if (char === '\\') index++;
      else if (char === quote) {
        quote = '';
        isAfterValue = true;
      } else if (
        quote === '`' &&
        char === '$' &&
        expression[index + 1] === '{'
      ) {
        braces.push(0);
        quote = '';
        isAfterValue = false;
        index++;
      }
      continue;
    }
    if (char === '"' || char === "'" || char === '`') quote = char;
    else if (braces.length && char === '{') {
      braces[braces.length - 1]++;
      isAfterValue = false;
    } else if (
      braces.length &&
      char === '}' &&
      braces[braces.length - 1] === 0
    ) {
      braces.pop();
      quote = '`';
    } else {
      if (char === '/') {
        const end = readSlashTokenEnd(expression, index, isAfterValue);
        if (end >= 0) {
          const next = expression[index + 1];
          if (next !== '/' && next !== '*') isAfterValue = true;
          index = end - 1;
          continue;
        }
      }
      if (char === '#' || char === '.' || char === '/' || char === '@') {
        JSON_POINTER_PATH_STICKY_REGEX.lastIndex = index;
        const path = JSON_POINTER_PATH_STICKY_REGEX.exec(expression);
        if (path !== null) {
          output += expression.slice(copied, index) + replace(path[0]);
          copied = index + path[0].length;
          index = copied - 1;
          isAfterValue = true;
          continue;
        }
      }
      if (braces.length && char === '}') braces[braces.length - 1]--;
      if (!WHITESPACE.test(char)) isAfterValue = VALUE_END.test(char);
    }
  }
  return copied ? output + expression.slice(copied) : expression;
};
