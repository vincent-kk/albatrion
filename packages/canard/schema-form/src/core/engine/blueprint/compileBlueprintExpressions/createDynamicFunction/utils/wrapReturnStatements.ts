/**
 * Coerce the final result of an authored statement body without rewriting JavaScript.
 * @param body - Valid JavaScript statements with optional returns and nested functions
 * @returns A function body returning a boolean, including false for implicit undefined
 */
export const wrapReturnStatements = (body: string): string =>
  'return !!(() => {\n' + body + '\n})();';
