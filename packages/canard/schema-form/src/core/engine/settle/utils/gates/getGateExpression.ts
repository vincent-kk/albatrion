import type { Optional } from '@aileron/declare';

import type { Blueprint, BlueprintExpression } from '../../../blueprint';
import { getBlueprintDerived } from '../../../utils/cache/derivedRecords';

/** Active gate expressions indexed by authored path for each analysis. */

/**
 * Find the first compiled active gate at an authored schema path.
 * @param blueprint - Immutable analysis shared by one tree's settlements
 * @param schemaPath - Authored gate address independent of live host path
 * @returns First matching active expression, or undefined when absent
 */
export const getGateExpression = (
  blueprint: Blueprint,
  schemaPath: string,
): Optional<BlueprintExpression> => {
  if (blueprint.capabilities.branchless) return undefined;
  let expressions = getBlueprintDerived<
    'gateExpressions',
    ReadonlyMap<string, BlueprintExpression>
  >(blueprint).gateExpressions;
  if (!expressions) {
    const indexed = new Map<string, BlueprintExpression>();
    for (const expression of blueprint.expressions)
      if (expression.key === 'active' && !indexed.has(expression.schemaPath))
        indexed.set(expression.schemaPath, expression);
    expressions = indexed;
    getBlueprintDerived<
      'gateExpressions',
      ReadonlyMap<string, BlueprintExpression>
    >(blueprint).gateExpressions = expressions;
  }
  return expressions.get(schemaPath);
};
