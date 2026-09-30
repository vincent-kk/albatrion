import type { Blueprint, BlueprintExpression } from '../../../blueprint';

/** Authored control expressions indexed once per immutable analysis. */
const CONTROL_EXPRESSIONS = new WeakMap<Blueprint,
  ReadonlyMap<string, BlueprintExpression>>();

/**
 * Find one compiled control expression without scanning the analysis each time.
 * @param blueprint - Immutable analysis shared by all settlements of this tree
 * @param declarationId - Authored declaration whose controls own the expression
 * @param schemaPath - Exact control key address in the authored schema
 * @param key - Control key compiled at that address
 * @returns Compiled expression or undefined when that declaration is not compiled
 */
export const getControlExpression = (
  blueprint: Blueprint, declarationId: number,
  schemaPath: string, key: string,
): BlueprintExpression | undefined => {
  let expressions = CONTROL_EXPRESSIONS.get(blueprint);
  if (!expressions) {
    expressions = new Map(blueprint.expressions.map((expression) => [
      JSON.stringify([expression.declarationId, expression.schemaPath,
        expression.key]), expression,
    ]));
    CONTROL_EXPRESSIONS.set(blueprint, expressions);
  }
  return expressions.get(JSON.stringify([declarationId, schemaPath, key]));
};
