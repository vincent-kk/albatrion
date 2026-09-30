import { SchemaFormError } from '../../../../errors';
import type { SchemaNodeRecord, SettlementScratch } from '../../../record';
import type { SettlementContext } from '../../type';
import { commitSettlement } from '../commit/commitSettlement';
import { captureDeriveBaseline } from '../derivation/captureDeriveBaseline';
import { runDeriveRounds } from '../derivation/runDeriveRounds';
import { BUDGET_EXCEEDED } from '../errors/settleErrorCode';
import { finalizeExits } from '../transition/finalizeExits';
import { restoreSourceB } from '../transition/restoreSourceB';
import { transitionSettlement } from '../transition/transitionSettlement';
import { publishStateKeys } from '../compute/publishStateKeys';

/**
 * Complete derivation, transition, rollback, and one commit after calculation.
 * @param context - Calculated call with any host budget failure
 * @param scratch - This call's explicit raw baseline container
 * @returns Nothing; committed records and runtime hold the result
 * @throws A deferred settlement failure after committing its diagnostics
 */
export const finishSettlement = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, scratch: SettlementScratch<Self>,
): void => {
  for (const path of context.changedRaw) scratch.explicitRaw.add(path);
  if (context.hostWheelExceeded && !context.failure) {
    context.failure = new SchemaFormError(BUDGET_EXCEEDED,
      `Host wheel budget exceeded at ${context.target.path}`,
      { path: context.target.path });
    context.cause = 'budget';
    context.exceededBudget = 'hostWheel';
    context.iterations = context.hostWheelExceeded;
  }
  if (!context.failure) runDeriveRounds(context);
  if (!context.failure) transitionSettlement(context);
  if (context.cause === 'budget') {
    restoreSourceB(context, scratch.explicitRaw);
    captureDeriveBaseline(context);
  }
  publishStateKeys(context);
  finalizeExits(context);
  if (context.kind === 'load')
    for (const path of context.target.runtime.typeMismatchPaths)
      if (!context.target.path || path === context.target.path ||
        path.startsWith(`${context.target.path}/`))
        context.target.runtime.typeMismatchPaths.delete(path);
  commitSettlement(context);
  if (context.failure) throw context.failure;
};
