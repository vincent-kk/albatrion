import { JSON_POINTER_PATH_REGEX } from './regex';
import { replaceScannedExpressionPaths } from './replaceScannedExpressionPaths';

/** Literal syntax, a comment opener, or a slash where a value is expected. */
const NON_CODE_HINT = /["'`\\[\^]|\/[/*]|(?:^|[^\w$)\]}.#@\s])\s*\//;

/**
 * Replace each JSON Pointer path in code, never inside strings, comments or regular expression literals.
 * @param expression - Authored expression text
 * @param replace - Called once per code path in source order; its result replaces the path
 * @returns The expression with code paths replaced; text with none of those forms takes one regex pass
 */
export const replaceExpressionPaths = (
  expression: string,
  replace: (path: string) => string,
): string =>
  NON_CODE_HINT.test(expression)
    ? replaceScannedExpressionPaths(expression, replace)
    : expression.replace(JSON_POINTER_PATH_REGEX, replace);
