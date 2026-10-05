import { JSON_POINTER_PATH_REGEX } from '../../../expressions/regex';

/**
 * Admit only literal/path/operator expressions whose entire reads are extracted.
 * @param source - Authored expression, never executed by this proof
 * @returns False for calls, blocks, ambient names, comments or dynamic access
 */
export const hasCompleteExpressionReads = (source: string): boolean => {
  const expression = source.replace(JSON_POINTER_PATH_REGEX, '0')
    .replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '0')
    .replace(/\b(?:true|false|null|undefined)\b/g, '0');
  return !/(?:[\d.)]\s*\(|\+\+|--|\/\/|\/\*|(^|[^=!<>])=([^=]|$))/.test(expression) &&
    /^[\s\d.()+\-*/%<>=!&|?:~]*$/.test(expression);
};
