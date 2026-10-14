import { JSON_POINTER_PATH_REGEX } from '../../../expressions/regex';

/** A single- or double-quoted string literal with escapes. */
const STRING_LITERAL = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g;

/** A `true`, `false`, `null` or `undefined` keyword literal. */
const KEYWORD_LITERAL = /\b(?:true|false|null|undefined)\b/g;

/** A call, increment or decrement, comment marker or assignment. */
const FORBIDDEN_EXPRESSION_SYNTAX =
  /(?:[\d.)]\s*\(|\+\+|--|\/\/|\/\*|(^|[^=!<>])=([^=]|$))/;

/** Text made only of characters an admitted expression may keep after literal removal. */
const ALLOWED_EXPRESSION_CHARACTERS = /^[\s\d.()+\-*/%<>=!&|?:~]*$/;

/**
 * Admit only literal/path/operator expressions whose entire reads are extracted.
 * @param source - Authored expression, never executed by this proof
 * @returns False for calls, blocks, ambient names, comments or dynamic access
 */
export const hasCompleteExpressionReads = (source: string): boolean => {
  const expression = source
    .replace(JSON_POINTER_PATH_REGEX, '0')
    .replace(STRING_LITERAL, '0')
    .replace(KEYWORD_LITERAL, '0');
  return (
    !FORBIDDEN_EXPRESSION_SYNTAX.test(expression) &&
    ALLOWED_EXPRESSION_CHARACTERS.test(expression)
  );
};
