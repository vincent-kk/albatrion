import type { FieldNodeRecord } from '../../../../../record';
import type { GateSelectionRound } from '../../../../types/gateSelectionRound';
import { gateSelectionTable } from '../../../gates/gateSelectionTable';
import { gateWheelEvaluation } from '../../../gates/gateWheelEvaluation';
import { readGateSelectionGroup } from '../../../gates/readGateSelectionGroup';
import { verifyTableGate } from '../../../gates/verifyTableGate';
import { verifyTablePrePublication } from '../../../gates/verifyTablePrePublication';
import { verifyUnvisitedGateStep } from '../../../gates/verifyUnvisitedGateStep';
import { selectEntryStep } from '../selectEntryStep';
import type { ChildSelectionFrame } from '../selectEntryStep';
import { createStaticEntryReuser } from '../utils/createStaticEntryReuser';
import { getTableVisitSteps } from './getTableVisitSteps';
import { mergeGateSteps } from './mergeGateSteps';
import { readGateBucket } from './readGateBucket';

/**
 * Merge read-site events with A ∪ R in authored order, sharing the original step body.
 * @param frame - Unchanged selection effects and immediate child computation
 * @param round - Eligible host round with root values already cached when E5 applies
 * @returns Nothing; only selected steps mutate the frame outside shadow confirmation
 */
export const selectTableChildren = <Self extends FieldNodeRecord<Self>>(
  frame: ChildSelectionFrame<Self>,
  round: GateSelectionRound,
): void => {
  const { table } = round;
  const reuse = createStaticEntryReuser(
    frame.node,
    frame.prior,
    frame.context,
    frame.next,
    frame.computeChild,
    frame.immediate,
  );
  let selected = getTableVisitSteps(frame, table);
  const active = new Set<number>();
  const verify = gateSelectionTable.mode === 'verify';
  const shadow = gateWheelEvaluation.mode === 'shadow';
  let groupIndex = 0;
  let cursor = 0;
  let fullIndex = 0;
  while (
    verify || shadow
      ? fullIndex < table.plan.steps.length
      : cursor < selected.length || groupIndex < table.groups.length
  ) {
    const index =
      verify || shadow
        ? fullIndex++
        : Math.min(
            selected[cursor] ?? Infinity,
            table.groups[groupIndex]?.firstStepIndex ?? Infinity,
          );
    const step = table.plan.steps[index];
    const tableStep = table.tableSteps.has(index);
    if (
      verify &&
      gateWheelEvaluation.mode === 'skip' &&
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
    const listed = selected[cursor] === index;
    if (listed) cursor++;
    const admitted = active.has(index);
    if (tableStep && (verify || shadow))
      verifyTableGate(frame.node, frame.context, step.gate!, admitted);
    if (!listed && !shadow) {
      if (verify) verifyUnvisitedGateStep(frame, step);
      continue;
    }
    frame.tableVerdict = tableStep ? admitted : undefined;
    if (reuse?.(step.entry)) continue;
    selectEntryStep(step.entry, step, frame);
  }
  frame.tableVerdict = undefined;
};
