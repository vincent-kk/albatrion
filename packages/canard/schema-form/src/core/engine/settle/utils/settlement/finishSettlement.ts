import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import type { FieldNodeRecord, SettlementScratch } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { commitSettlement } from '../commit/commitSettlement';
import { effectiveType } from '../commit/effectiveType';
import { discardStaticHostPreparation } from '../compute/childSelection/utils/discardStaticHostPreparation';
import { publishStateKeys } from '../compute/publishStateKeys';
import { captureDeriveBaseline } from '../derivation/captureDeriveBaseline';
import { runDeriveRounds } from '../derivation/runDeriveRounds';
import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { alignArraySnapshotSlots } from '../loadValues/alignArraySnapshotSlots';
import { finalizeExits } from '../transition/finalizeExits';
import { restoreSourceB } from '../transition/restoreSourceB';
import { transitionSettlement } from '../transition/transitionSettlement';

/**
 * Complete derivation, transition, rollback, and one commit after calculation.
 * @param context - Calculated call with any host budget failure
 * @param scratch - This call's explicit raw baseline container
 * @param scalarWrite - Caller-proven live scalar with unchanged type and no derive capability
 * @returns Nothing; committed records and runtime hold the result
 * @throws Deferred failures after commit when no dispatch chain owns them
 */
export const finishSettlement = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  scratch: SettlementScratch<Self>,
  scalarWrite = false,
): void => {
  for (const path of context.changedRaw) scratch.explicitRaw.add(path);
  if (context.hostWheelExceeded && !context.exceededBudget) {
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
  if (
    !scalarWrite &&
    !context.exceededBudget &&
    context.root.runtime.blueprint.capabilities.hasDerive
  )
    runDeriveRounds(context);
  if (
    !context.exceededBudget &&
    (context.hasGates ||
      context.entered.size > 0 ||
      context.exited.size > 0 ||
      context.writtenInputs.size > 1 ||
      (context.writtenInputs.size === 1 &&
        (!context.writtenInputs.has(context.target) ||
          (!scalarWrite &&
            effectiveType(context.target) !== context.target.schemaType))))
  )
    transitionSettlement(context);
  if (context.exceededBudget) {
    restoreSourceB(context, scratch.explicitRaw);
    captureDeriveBaseline(context);
  }
  publishStateKeys(context);
  if (
    context.pendingExits.size > 0 ||
    context.perished.size > 0 ||
    context.entered.size > 0 ||
    context.revived.size > 0 ||
    context.exited.size > 0 ||
    context.filledNodes.size > 0 ||
    context.arrayCounts.size > 0
  )
    finalizeExits(context);
  if (context.kind !== 'load' && context.arrayCounts.size > 0) {
    const append = context.arrayAppend;
    const pop = context.arrayPop;
    // The append's or pop's tail application already published a dense slot per item.
    const aligned =
      append &&
      append.host.runtime.loadSnapshot === append.snapshot &&
      append.host.itemCount === append.count + 1
        ? append.host
        : pop &&
            pop.host.runtime.loadSnapshot === pop.snapshot &&
            pop.host.itemCount === pop.count - 1
          ? pop.host
          : undefined;
    const resized = [...context.arrayCounts]
      .filter(
        ([host, previousCount]) =>
          host !== aligned &&
          !host.detached &&
          host.itemCount !== previousCount,
      )
      .map(([host]) => host);
    alignArraySnapshotSlots(resized);
  }
  if (context.kind === 'load')
    for (const path of context.target.runtime.misfitPaths)
      if (
        !context.target.path ||
        path === context.target.path ||
        isDescendantPath(path, context.target.path)
      )
        context.target.runtime.misfitPaths.delete(path);
  commitSettlement(context);
  const failures = context.failures;
  if (failures?.length || context.pathChanges.length > 0)
    discardStaticHostPreparation(context);
  if (!failures?.length) return;
  const runtime = context.root.runtime;
  if (runtime.entryDepth && runtime.chainErrors) return;
  throw failures.length === 1
    ? failures[0]
    : new SchemaFormError(
        FormErrorCode.MultipleErrors,
        'Multiple settlement errors',
        {
          errors: failures,
        },
      );
};
