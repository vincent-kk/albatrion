import { FormErrorCode, SchemaFormError } from '../../../../../../errors';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { computeNode } from '../../compute/computeNode';
import { registerRecalculation } from '../../dependencies/registerRecalculation';
import { recordSettlementFailure } from '../../errors/recordSettlementFailure';

/**
 * Recompute the tree after one wave of automatic writes and record a host wheel overrun.
 * @param context - Settlement whose automatic marks were just applied; its automatic flag is off
 * @returns Whether the settlement exceeded a budget and must stop deriving
 */
export const computeDeriveWave = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): boolean => {
  registerRecalculation(context);
  context.hostWheelExceeded = undefined;
  computeNode(context.root, context);
  if (context.hostWheelExceeded !== undefined && !context.exceededBudget) {
    recordSettlementFailure(
      context,
      new SchemaFormError(
        FormErrorCode.BudgetExceeded,
        `Host wheel budget exceeded at ${context.target.path}`,
        { path: context.target.path },
      ),
      'budget',
    );
    context.exceededBudget = 'hostWheel';
    context.iterations = context.hostWheelExceeded;
  }
  return context.exceededBudget !== undefined;
};
