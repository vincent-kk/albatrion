import { wrapReturnStatements } from './wrapReturnStatements';

/**
 * Build a function body without evaluating the expression.
 * @param expression - Processed expression with dependency references.
 * @param coerceToBoolean - Whether returned values require boolean coercion.
 * @returns Body for a dependency-array function.
 */
export const getFunctionBody = (
  expression: string,
  coerceToBoolean: boolean,
): string => {
  if (expression.startsWith('{') && expression.endsWith('}')) {
    const functionBody = expression.slice(1, -1).trim();
    if (coerceToBoolean) return wrapReturnStatements(functionBody);
    return functionBody;
  }
  return coerceToBoolean ? `return !!(${expression})` : `return ${expression}`;
};
