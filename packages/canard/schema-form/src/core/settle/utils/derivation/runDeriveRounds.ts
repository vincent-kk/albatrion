import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { SchemaFormError } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import { DERIVE_ROUND_CAP, evaluateDeriveRound } from '../../derive';
import type { SettlementContext } from '../../type';
import { computeNode } from '../compute/computeNode';
import { sameValue } from '../compute/sameValue';
import { BUDGET_EXCEEDED, EXPRESSION_THREW, INJECT_TARGET_MISSING,
  INVALID_VIRTUAL_NODE_VALUES } from '../errors/settleErrorCode';
import { registerRecalculation } from '../write/registerRecalculation';
import { collectDeriveSourcePaths } from './collectDeriveSourcePaths';
import { getDeriveState } from './getDeriveState';
import { applyDeriveWrite } from './utils/applyDeriveWrite';

/** Deferred error codes follow the failure's contract category. */
const ERROR_CODES = { expression: EXPRESSION_THREW,
  injectTarget: INJECT_TARGET_MISSING, writeShape: INVALID_VIRTUAL_NODE_VALUES } as const;
/** Human-readable failure labels retain the existing expression wording. */
const ERROR_LABELS = { expression: 'Derive expression failed',
  injectTarget: 'Injection target missing', writeShape: 'Invalid virtual node values' } as const;

/**
 * Apply bounded automatic candidates and recalculate before the next decision.
 * @param context - Current write and its reversible automatic log
 * @returns Nothing; failures and applied-round count stay in the settlement
 */
export const runDeriveRounds = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const state = getDeriveState(context);
  if (!state || context.exceededBudget) return;
  const previousTransition = context.inTransition;
  try {
    while (true) {
      state.sourcePaths = context.loadScope
        ? undefined
        : collectDeriveSourcePaths(context);
      const decision = evaluateDeriveRound(context.root, state);
      if (state.trace) (context.traceRounds ??= []).push([...decision.trace]);
      for (const failure of decision.failures) {
        recordSettlementFailure(context, new SchemaFormError(
          ERROR_CODES[failure.kind],
          `${ERROR_LABELS[failure.kind]} at ${failure.schemaPath}`,
          {
            path: failure.targetPath ?? failure.sourcePath,
            schemaPath: failure.schemaPath,
            cause: failure.cause,
            ...(failure.expectedLength === undefined ? {} :
              { expectedLength: failure.expectedLength, received: failure.cause }),
          },
        ), failure.kind);
      }
      const changed = decision.writes.filter(
        (write) => !write.target || write.target.blueprintNode.kind === 'virtual' ||
          !sameValue(write.target.emit, write.value),
      );
      if (changed.length === 0) return;
      if ((context.deriveRounds ?? 0) >= DERIVE_ROUND_CAP) {
        recordSettlementFailure(context, new SchemaFormError(
          BUDGET_EXCEEDED,
          `Derive budget exceeded at ${context.target.path}`,
          { path: context.target.path },
        ), 'budget');
        context.exceededBudget = 'derive';
        context.iterations = DERIVE_ROUND_CAP;
        context.deriveBudgetRules = decision.trace;
        return;
      }
      context.deriveRounds = (context.deriveRounds ?? 0) + 1;
      context.automaticChanged = false;
      context.automatic = true;
      context.inTransition = true;
      for (const write of changed) {
        applyDeriveWrite(write, context);
        state.appliedRanks.set(write.targetPath,
          Math.max(state.appliedRanks.get(write.targetPath) ?? 0, write.rank));
      }
      context.automatic = false;
      registerRecalculation(context);
      context.hostWheelExceeded = undefined;
      computeNode(context.root, context);
      if (context.hostWheelExceeded !== undefined && !context.exceededBudget) {
        recordSettlementFailure(context, new SchemaFormError(
          BUDGET_EXCEEDED,
          `Host wheel budget exceeded at ${context.target.path}`,
          { path: context.target.path },
        ), 'budget');
        context.exceededBudget = 'hostWheel';
        context.iterations = context.hostWheelExceeded;
        return;
      }
      if (context.exceededBudget) return;
    }
  } finally {
    context.automatic = false;
    context.inTransition = previousTransition;
  }
};
