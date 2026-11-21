import { maxLite } from '@winglet/common-utils/math';

import type { Optional } from '@aileron/declare';

import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import { DeriveConvergenceTargets } from '../../../blueprint';
import { DERIVE_ROUND_CAP, evaluateDeriveRound } from '../../../derive';
import type { DeriveRoundDecision } from '../../../derive';
import type { FieldNodeRecord } from '../../../record';
import { engineModes } from '../../../utils/cache/engineModes';
import { sameValue } from '../../../utils/compute/sameValue';
import type { SettlementContext } from '../../types/settlement';
import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { collectDeriveSourcePaths } from './collectDeriveSourcePaths';
import { getDeriveState } from './getDeriveState';
import { applyDeriveWrite } from './utils/applyDeriveWrite';
import { computeDeriveWave } from './utils/computeDeriveWave';
import { hasOverlappingWrites } from './utils/hasOverlappingWrites';
import { readWriteAddresses } from './utils/readWriteAddresses';
import { retainEqualDeriveWrite } from './utils/retainEqualDeriveWrite';

/** Deferred error codes follow the failure's contract category. */
const ERROR_CODES = {
  expression: FormErrorCode.ExpressionThrew,
  injectTarget: FormErrorCode.InjectTargetMissing,
  writeShape: FormErrorCode.InvalidVirtualNodeValues,
} as const;
/** Human-readable failure labels retain the existing expression wording. */
const ERROR_LABELS = {
  expression: 'Derive expression failed',
  injectTarget: 'Injection target missing',
  writeShape: 'Invalid virtual node values',
} as const;

/** Whether an address equals, contains or lies inside one already written in this wave. */
const overlapsAddress = (
  wave: readonly string[],
  addresses: readonly string[],
) =>
  addresses.some((address) =>
    wave.some(
      (path) =>
        path === address ||
        isDescendantPath(path, address) ||
        isDescendantPath(address, path),
    ),
  );

/** Whether a write would leave its live target as it is now; a virtual write always counts as a change. */
const isUnchanged = <Self extends FieldNodeRecord<Self>>(
  write: DeriveRoundDecision<Self>['writes'][number],
) =>
  !!write.target &&
  write.target.blueprintNode.kind !== 'virtual' &&
  sameValue(write.target.storedOutputValue, write.value);

/**
 * Apply bounded automatic candidates and recalculate before the next decision.
 * @param context - Current settlement with its write boundary and retained-source decisions
 * @returns Nothing; failures and applied-round count stay in the settlement
 * Package Vitest setup owns the module-local shadow switch; passing it through
 * SettlementContext would expose test-only verification in runtime contracts.
 */
export const runDeriveRounds = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const state = getDeriveState(context);
  if (!state || context.exceededBudget) return;
  const wasInTransition = context.isInTransition;
  try {
    while (true) {
      state.sourcePaths = context.loadScope
        ? undefined
        : collectDeriveSourcePaths(context);
      const decision = evaluateDeriveRound(context.root, state);
      if (state.isTraceEnabled)
        (context.traceRounds ??= []).push([...decision.trace]);
      for (const failure of decision.failures) {
        recordSettlementFailure(
          context,
          new SchemaFormError(
            ERROR_CODES[failure.kind],
            `${ERROR_LABELS[failure.kind]} at ${failure.schemaPath}`,
            {
              path: failure.targetPath ?? failure.sourcePath,
              schemaPath: failure.schemaPath,
              cause: failure.cause,
              ...(failure.kind === 'injectTarget' ||
              failure.kind === 'writeShape'
                ? { sourcePath: failure.sourcePath }
                : {}),
              ...(failure.expectedLength === undefined
                ? {}
                : {
                    expectedLength: failure.expectedLength,
                    received: failure.cause,
                  }),
            },
          ),
          failure.kind,
          [
            failure.kind,
            failure.sourcePath,
            failure.targetPath ?? '',
            failure.schemaPath,
          ].join('\u0000'),
        );
      }
      const changed: DeriveRoundDecision<Self>['writes'][number][] = [];
      for (let index = 0; index < decision.writes.length; index++)
        if (!isUnchanged(decision.writes[index]))
          changed.push(decision.writes[index]);
      if (changed.length === 0) {
        for (const write of decision.writes)
          retainEqualDeriveWrite(write, context);
        return;
      }
      if ((context.deriveRounds ?? 0) >= DERIVE_ROUND_CAP) {
        recordSettlementFailure(
          context,
          new SchemaFormError(
            FormErrorCode.BudgetExceeded,
            `Derive budget exceeded at ${context.target.path}`,
            { path: context.target.path },
          ),
          'budget',
        );
        context.exceededBudget = 'derive';
        context.iterations = DERIVE_ROUND_CAP;
        context.deriveBudgetRules = decision.trace;
        return;
      }
      context.deriveRounds = (context.deriveRounds ?? 0) + 1;
      context.hasAutomaticChanged = false;
      context.isAutomatic = true;
      context.isInTransition = true;
      const terminalTargets = DeriveConvergenceTargets.getOrCollect(
        context.root.runtime.blueprint,
      );
      let skipConfirmation =
        terminalTargets !== undefined && decision.failures.length === 0;
      // Winners arrive in ascending rank. When two overlap, each write waits for the compute of the
      // earlier one it overlaps and is tested against the value that compute left, so a higher
      // winner equal to the round's starting value still replaces a lower one.
      const isLayered =
        decision.writes.length > 1 && hasOverlappingWrites(decision.writes);
      if (
        !isLayered &&
        changed.length !== decision.writes.length &&
        (context.filledNodes.size || context.hasRevivedSlotSources)
      )
        for (const write of decision.writes)
          if (isUnchanged(write)) retainEqualDeriveWrite(write, context);
      const writes = isLayered ? decision.writes : changed;
      let wave: Optional<string[]>;
      for (let index = 0; index < writes.length; index++) {
        const write = writes[index];
        if (isLayered) {
          const addresses = readWriteAddresses(write);
          if (wave && overlapsAddress(wave, addresses)) {
            context.isAutomatic = false;
            if (computeDeriveWave(context)) return;
            context.isAutomatic = true;
            wave = undefined;
          }
          if (write.target?.isDetached) continue;
          if (isUnchanged(write)) {
            retainEqualDeriveWrite(write, context);
            continue;
          }
          (wave ??= []).push(...addresses);
        }
        if (skipConfirmation && !terminalTargets!.has(write.targetPath))
          skipConfirmation = false;
        applyDeriveWrite(write, context);
        state.appliedRanks.set(
          write.targetPath,
          maxLite(state.appliedRanks.get(write.targetPath) ?? 0, write.rank),
        );
      }
      context.isAutomatic = false;
      if (computeDeriveWave(context)) return;
      if (skipConfirmation) {
        if (engineModes.isDeriveShadowEnabled) {
          state.sourcePaths = context.loadScope
            ? undefined
            : collectDeriveSourcePaths(context);
          const confirmation = evaluateDeriveRound(context.root, state);
          if (
            confirmation.writes.length !== 0 ||
            confirmation.failures.length !== 0
          )
            throw new Error(
              'Derive convergence proof failed: confirmation was not empty',
            );
        }
        if (state.isTraceEnabled) (context.traceRounds ??= []).push([]);
        return;
      }
    }
  } finally {
    context.isAutomatic = false;
    context.isInTransition = wasInTransition;
  }
};
