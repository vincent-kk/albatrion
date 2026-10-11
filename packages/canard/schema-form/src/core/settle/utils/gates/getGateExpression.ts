import type { Blueprint, BlueprintExpression } from '../../../blueprint';

/** Active gate expressions indexed by authored path for each analysis. */
const GATE_EXPRESSIONS = new WeakMap<Blueprint,
  ReadonlyMap<string, BlueprintExpression>>();

/**
 * Find the first compiled active gate at an authored schema path.
 * @param blueprint - Immutable analysis shared by one tree's settlements
 * @param schemaPath - Authored gate address independent of live host path
 * @returns First matching active expression, or undefined when absent
 */
export const getGateExpression = (
  blueprint: Blueprint, schemaPath: string,
): BlueprintExpression | undefined => {
  if (blueprint.capabilities.branchless) return undefined;
  let expressions = GATE_EXPRESSIONS.get(blueprint);
  if (!expressions) {
    const indexed = new Map<string, BlueprintExpression>();
    for (const expression of blueprint.expressions)
      if (expression.key === 'active' && !indexed.has(expression.schemaPath))
        indexed.set(expression.schemaPath, expression);
    expressions = indexed;
    GATE_EXPRESSIONS.set(blueprint, expressions);
  }
  return expressions.get(schemaPath);
};
