import { MULTIPLE_ERRORS, SchemaFormError } from '../../../../errors';
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
 * @throws Deferred failures after commit when no dispatch chain owns them
 */
export const finishSettlement = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, scratch: SettlementScratch<Self>,
): void => {
  for (const path of context.changedRaw) scratch.explicitRaw.add(path);
  if (context.hostWheelExceeded && context.cause !== 'budget') {
    context.failure = new SchemaFormError(BUDGET_EXCEEDED,
      `Host wheel budget exceeded at ${context.target.path}`,
      { path: context.target.path });
    context.cause = 'budget';
    context.exceededBudget = 'hostWheel';
    context.iterations = context.hostWheelExceeded;
  }
  if (context.cause !== 'budget') runDeriveRounds(context);
  if (context.cause !== 'budget') transitionSettlement(context);
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
  const failures = context.gateFailures;
  if (failures?.length) {
    const runtime = context.root.runtime;
    if (runtime.entryDepth && runtime.chainErrors) {
      if (context.failure && failures.includes(context.failure)) return;
    } else {
      const errors = context.failure && !failures.includes(context.failure)
        ? [context.failure, ...failures] : failures;
      throw errors.length === 1 ? errors[0] : new SchemaFormError(MULTIPLE_ERRORS,
        'Multiple settlement errors', { errors });
    }
  }
  if (context.failure) throw context.failure;
};
