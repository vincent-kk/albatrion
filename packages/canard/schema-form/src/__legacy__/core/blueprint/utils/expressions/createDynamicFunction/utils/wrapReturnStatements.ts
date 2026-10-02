/**
 * Wraps return statement values with !!() for boolean coercion in block expressions.
 * - `return expr;` → `return !!(expr);`
 * - `return;` → `return false;`
 * @param body - Block body content (outer braces already removed)
 * @returns Transformed block body
 */
export const wrapReturnStatements = (body: string): string =>
  body.replace(RETURN_PATTERN, (_, __, ___, expression) =>
    expression ? `return !!(${expression.trim()})` : 'return false',
  );

const RETURN_PATTERN = /\breturn([ \t]*)(?:([ \t]+)(.+?))?(?=;|\n|$)/g;
