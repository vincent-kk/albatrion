import { readSlashTokenEnd } from './readSlashTokenEnd';
import { JSON_POINTER_PATH_STICKY_REGEX } from './regex';

/** A closed string literal, consuming escaped code units as text. */
const STRING_LITERAL = /"(?:[^"\\]|\\[\s\S])*"|'(?:[^'\\]|\\[\s\S])*'/y;

/**
 * Check for ECMAScript whitespace, which preserves the previous token's value state.
 * @param character - Current expression code unit, if there is one.
 * @param code - Numeric value of that code unit, or NaN at the end of the input.
 * @returns Whether the scanner should preserve the preceding token's state.
 */
const isWhitespace = (character: string, code: number): boolean =>
  code === 32 ||
  (code >= 9 && code <= 13) ||
  (code >= 160 && /\s/.test(character));

/** ASCII identifier flags: 1 permits continuation and 2 permits a first character. */
const IDENTIFIER_FLAGS = Uint8Array.from({ length: 128 }, (_, code) =>
  code === 36 || code === 95 || (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
    ? 3
    : code >= 48 && code <= 57 ? 1 : 0,
);
/** Keywords that leave the following token in an operand or statement position. */
const REGEXP_PREFIX_KEYWORD =
  /^(?:return|throw|typeof|case|in|of|void|delete|await|yield|else|do)$/;

/**
 * Replace paths in code only, skipping strings, template text, comments and regular expression literals.
 * @param expression - Authored expression text
 * @param replace - Called once per code path in source order; its result replaces the path
 * @returns The expression with code paths replaced; non-code text is copied unchanged
 */
export const replaceExpressionPaths = (
  expression: string,
  replace: (path: string) => string,
): string => {
  let braces: number[] | undefined;
  let output = '';
  let copied = 0;
  let isInTemplateText = false;
  let isAfterValue = false;
  for (let index = 0; index < expression.length; index++) {
    const char = expression[index];
    if (isInTemplateText) {
      if (char === '\\') index++;
      else if (char === '`') {
        isInTemplateText = false;
        isAfterValue = true;
      } else if (char === '$' && expression[index + 1] === '{') {
        (braces ??= []).push(0);
        isInTemplateText = false;
        isAfterValue = false;
        index++;
      }
      continue;
    }
    if (char === ' ') continue;
    if (char === '"' || char === "'") {
      STRING_LITERAL.lastIndex = index;
      if (!STRING_LITERAL.test(expression)) break;
      index = STRING_LITERAL.lastIndex - 1;
      isAfterValue = true;
    } else if (char === '`') isInTemplateText = true;
    else if (char === '{' && braces?.length) {
      braces[braces.length - 1]++;
      isAfterValue = false;
    } else if (
      char === '}' &&
      braces?.length &&
      braces[braces.length - 1] === 0
    ) {
      braces.pop();
      isInTemplateText = true;
    } else {
      const next = expression[index + 1];
      if (char === '/' && next === ' ' && isAfterValue) {
        isAfterValue = false;
        index++;
        continue;
      }
      if (char === '/' && (!isAfterValue || next === '/' || next === '*')) {
        const end = readSlashTokenEnd(expression, index, isAfterValue);
        if (end >= 0) {
          if (next !== '/' && next !== '*') isAfterValue = true;
          index = end - 1;
          continue;
        }
      }
      if (
        char === '#' ||
        (char === '/' &&
          !isWhitespace(next, expression.charCodeAt(index + 1))) ||
        char === '@' ||
        (char === '.' &&
          (next === '/' || expression[index + 2] === '/'))
      ) {
        JSON_POINTER_PATH_STICKY_REGEX.lastIndex = index;
        const path = JSON_POINTER_PATH_STICKY_REGEX.exec(expression);
        if (path !== null) {
          const text = braces?.length ? cutAtOpenBrace(path[0]) : path[0];
          output += expression.slice(copied, index) + replace(text);
          copied = index + text.length;
          index = copied - 1;
          isAfterValue = true;
          continue;
        }
      }
      if (char === '}' && braces?.length) braces[braces.length - 1]--;
      const code = expression.charCodeAt(index);
      const flags = IDENTIFIER_FLAGS[code];
      if (!isWhitespace(char, code)) {
        if (flags & 2) {
          const start = index;
          while (
            IDENTIFIER_FLAGS[expression.charCodeAt(index + 1)] & 1
          )
            index++;
          isAfterValue = !REGEXP_PREFIX_KEYWORD.test(
            expression.slice(start, index + 1),
          );
          if (!isAfterValue) {
            let previous = start - 1;
            while (
              previous >= 0 &&
              isWhitespace(expression[previous], expression.charCodeAt(previous))
            )
              previous--;
            isAfterValue = expression[previous] === '.';
          }
        } else
          isAfterValue = !!(flags & 1) || char === ')' || char === ']' || char === '}';
      }
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
