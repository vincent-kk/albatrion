import { replaceExpressionPaths } from '../../../utils/expressions/replaceExpressionPaths';
import type { PathManager } from '../../getPathManager';

/** One semicolon at the end of an expression. */
const TRAILING_SEMICOLON = /;$/;

/**
 * Replace authored paths using the compiler's exact substitution order.
 * @param pathManager - Invocation-owned registry mutated in first-occurrence order
 * @param expression - Authored text, including strings and optional trailing semicolon
 * @returns Trimmed dependency-array expression with one final semicolon removed
 */
export const substituteDependencyPaths = (
  pathManager: PathManager,
  expression: string,
): string =>
  replaceExpressionPaths(expression, (path) => {
    pathManager.set(path);
    return 'dependencies[' + pathManager.findIndex(path) + ']';
  })
    .trim()
    .replace(TRAILING_SEMICOLON, '');
