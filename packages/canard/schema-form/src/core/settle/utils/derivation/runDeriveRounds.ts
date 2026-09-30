import { SchemaFormError } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import { DERIVE_ROUND_CAP, evaluateDeriveRound } from '../../derive';
import type { SettlementContext } from '../../type';
import { computeNode } from '../compute/computeNode';
import { sameValue } from '../compute/sameValue';
import { BUDGET_EXCEEDED, EXPRESSION_THREW } from '../errors/settleErrorCode';
import { markWrite } from '../write/markWrite';
import { registerRecalculation } from '../write/registerRecalculation';
import { collectDeriveSourcePaths } from './collectDeriveSourcePaths';
import { getDeriveState } from './getDeriveState';

/**
 * Apply bounded automatic candidates and recalculate before the next decision.
 * @param context - Current write and its reversible automatic log
 * @returns Nothing; failures and applied-round count stay in the settlement
 */
export const runDeriveRounds = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const state = getDeriveState(context);
  if (!state || context.failure) return;
  const previousTransition = context.inTransition;
  try {
    while (true) {
      state.sourcePaths = context.loadScope
        ? undefined
        : collectDeriveSourcePaths(context);
      const decision = evaluateDeriveRound(context.root, state);
      if (state.trace) (context.traceRounds ??= []).push([...decision.trace]);
      if (decision.failure) {
        context.failure = new SchemaFormError(
          EXPRESSION_THREW,
          `Derive expression failed at ${decision.failure.schemaPath}`,
          {
            path: decision.failure.sourcePath,
            schemaPath: decision.failure.schemaPath,
            cause: decision.failure.cause,
          },
        );
        context.cause = 'expression';
        return;
      }
      const changed = decision.writes.filter(
        (write) => !sameValue(write.target.emit, write.value),
      );
      if (changed.length === 0) return;
      if ((context.deriveRounds ?? 0) >= DERIVE_ROUND_CAP) {
        context.failure = new SchemaFormError(
          BUDGET_EXCEEDED,
          `Derive budget exceeded at ${context.target.path}`,
          { path: context.target.path },
        );
        context.cause = 'budget';
        context.exceededBudget = 'derive';
        context.iterations = DERIVE_ROUND_CAP;
        context.deriveBudgetRules = decision.trace;
        return;
      }
      context.deriveRounds = (context.deriveRounds ?? 0) + 1;
      context.automaticChanged = false;
      context.automatic = true;
      context.inTransition = true;
      for (const write of changed)
        markWrite(write.target, write.value, context);
      context.automatic = false;
      registerRecalculation(context);
      context.hostWheelExceeded = undefined;
      computeNode(context.root, context);
      if (context.hostWheelExceeded !== undefined) {
        context.failure = new SchemaFormError(
          BUDGET_EXCEEDED,
          `Host wheel budget exceeded at ${context.target.path}`,
          { path: context.target.path },
        );
        context.cause = 'budget';
        context.exceededBudget = 'hostWheel';
        context.iterations = context.hostWheelExceeded;
        return;
      }
    }
  } finally {
    context.automatic = false;
    context.inTransition = previousTransition;
  }
};
