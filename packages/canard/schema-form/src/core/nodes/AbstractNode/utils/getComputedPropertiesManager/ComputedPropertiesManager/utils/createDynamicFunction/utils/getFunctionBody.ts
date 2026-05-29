import { wrapReturnStatements } from './wrapReturnStatements';

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
