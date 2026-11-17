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
          const text = braces.length ? cutAtOpenBrace(path[0]) : path[0];
          output += expression.slice(copied, index) + replace(text);
          copied = index + text.length;
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

/**
 * Cut a path read inside a template placeholder at the first `}` it did not open, which closes an enclosing brace.
 * @param path - Path match starting in placeholder code
 * @returns The path up to that brace, or the whole path when every `}` closes a `{` of its own
 */
const cutAtOpenBrace = (path: string): string => {
  let depth = 0;
  for (let index = 0; index < path.length; index++)
    if (path[index] === '{') depth++;
    else if (path[index] === '}' && depth-- === 0) return path.slice(0, index);
  return path;
};
