import type { BlueprintExpression } from '../../types/blueprint';

/** Read-only compiler facts; mode resets never erase this creation evidence. */
export const CompleteExpressionReads = {
  has(expression: BlueprintExpression): boolean {
    return expression.completeReads === true;
  },
};
