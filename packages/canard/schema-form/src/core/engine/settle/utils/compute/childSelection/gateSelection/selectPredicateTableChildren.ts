import type { FieldNodeRecord } from '../../../../../record';
import { engineModes } from '../../../../../utils/cache/engineModes';
import type { GateSelectionRound } from '../../../../types/gateSelectionRound';
import { evaluateGate } from '../../../gates/evaluateGate';
import { getGateRegistry } from '../../../gates/getGateRegistry';
import { readGateSelectionGroup } from '../../../gates/readGateSelectionGroup';
import { verifyTableGate } from '../../../gates/verifyTableGate';
import { verifyTablePrePublication } from '../../../gates/verifyTablePrePublication';
import { verifyUnvisitedGateStep } from '../../../gates/verifyUnvisitedGateStep';
import { selectEntryStep } from '../selectEntryStep';
import type { ChildSelectionFrame } from '../selectEntryStep';
import { getTableVisitSteps } from './getTableVisitSteps';
import { mergeGateSteps } from './mergeGateSteps';
import { readGateBucket } from './readGateBucket';

/**
 * Merge read-site events with A ∪ R in authored order, sharing the original step body.
 * @param frame - Unchanged selection effects and immediate child computation
 * @param round - Eligible host round with root values already cached when E5 applies
 * @returns Nothing; only selected steps mutate the frame outside shadow confirmation
 */
export const selectPredicateTableChildren = <
  Self extends FieldNodeRecord<Self>,
>(
  frame: ChildSelectionFrame<Self>,
  round: GateSelectionRound,
): void => {
  const { table } = round;
  const reuse = frame.reuseStatic;
  let selected = getTableVisitSteps(frame, table);
  const active = new Set<number>();
  let throwing: Set<number> | undefined;
  let firstThrow: Set<number> | undefined;
  let predicateSteps: readonly number[] | undefined;
  let predicateCursor = 0;
  const verify = engineModes.gateSelection === 'verify';
  const shadow = engineModes.gateWheel === 'shadow';
  let groupIndex = 0;
  let predicateIndex = 0;
  let cursor = 0;
  let fullIndex = 0;
  while (
    verify || shadow
      ? fullIndex < table.plan.steps.length
      : cursor < selected.length ||
        groupIndex < table.groups.length ||
        predicateIndex < table.predicateGroups.length ||
        predicateCursor < (predicateSteps?.length ?? 0)
  ) {
    const index =
      verify || shadow
        ? fullIndex++
        : Math.min(
            selected[cursor] ?? Infinity,
            table.groups[groupIndex]?.firstStepIndex ?? Infinity,
            table.predicateGroups[predicateIndex]?.steps[0] ?? Infinity,
            predicateSteps?.[predicateCursor] ?? Infinity,
          );
    const step = table.plan.steps[index];
    const tableStep = table.tableSteps.has(index);
    if (
      verify &&
      engineModes.gateWheel === 'skip' &&
      tableStep &&
      frame.flushReads &&
      frame.context.pendingOutputs?.size
    )
      verifyTablePrePublication(frame.node, frame.context, step.entry);
    while (
      groupIndex < table.groups.length &&
      table.groups[groupIndex].firstStepIndex <= index
    ) {
      const group = table.groups[groupIndex++];
      const value = readGateSelectionGroup(frame.node, frame.context, group);
      const bucket = readGateBucket(group.buckets, value);
      for (const entry of bucket) active.add(entry);
      selected = mergeGateSteps(selected, bucket);
    }
    while (
      predicateIndex < table.predicateGroups.length &&
      table.predicateGroups[predicateIndex].steps[0] <= index
    ) {
      const group = table.predicateGroups[predicateIndex++];
      const version = frame.context.gateThrowVersion;
      const occurrence = getGateRegistry(frame.node.runtime).locate(
        frame.node,
        group.gate,
      );
      const cached =
        frame.context.gateWheelFrame?.predicateResults?.get(occurrence);
      if (cached ?? evaluateGate(group.gate, frame.context, frame.node)) {
        predicateSteps = group.steps;
        predicateCursor = 0;
      } else if (frame.context.gateThrowVersion !== version) {
        selected = mergeGateSteps(selected, group.steps);
        (firstThrow ??= new Set()).add(index);
        for (const entry of group.steps) (throwing ??= new Set()).add(entry);
      }
    }
    const selectedStep = selected[cursor] === index;
    const predicateStep = predicateSteps?.[predicateCursor] === index;
    const listed = selectedStep || predicateStep;
    if (selectedStep) cursor++;
    if (predicateStep) predicateCursor++;
    const admitted = active.has(index) || predicateStep;
    const failedPredicate = throwing?.has(index) === true;
    if (tableStep && !failedPredicate && (verify || shadow))
      verifyTableGate(frame.node, frame.context, step.gate!, admitted);
    if (!listed && !shadow) {
      if (verify) verifyUnvisitedGateStep(frame, step);
      continue;
    }
    frame.tableVerdict =
      tableStep && (!failedPredicate || firstThrow?.has(index))
        ? admitted
        : undefined;
    frame.tableThrew = firstThrow?.has(index);
    if (reuse?.(step.entry)) continue;
    selectEntryStep(step.entry, step, frame);
  }
  frame.tableVerdict = undefined;
  frame.tableThrew = undefined;
};
