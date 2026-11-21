import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { CandidateInput } from '../../types/candidateInput';
import type { SettlementContext } from '../../types/settlement';
import { getSourceBoundary } from './getSourceBoundary';

/**
 * Record the latest accepted input at one departing candidate.
 * @param owner - Actual occurrence on the exit boundary
 * @param suffix - Physical address below that occurrence
 * @param template - Exact target declaration
 * @param value - Defined accepted input
 * @param context - Settlement that owns the candidate decision
 * @param order - Original application rank, when the same input is rerouted
 * @returns Nothing; only the latest input at this candidate remains
 */
export const recordExitInput = <Self extends FieldNodeRecord<Self>>(
  owner: Self,
  suffix: string,
  template: BlueprintNode,
  value: unknown,
  context: SettlementContext<Self>,
  order = (context.retainedWriteOrder = (context.retainedWriteOrder ?? 0) + 1),
): void => {
  const source = getSourceBoundary(owner, context);
  const inputs: Map<
    BlueprintNode,
    Map<string, CandidateInput>
  > = (source.exitInputs ??= new Map());
  let paths = inputs.get(template);
  if (!paths) inputs.set(template, (paths = new Map()));
  if ((paths.get(suffix)?.order ?? 0) <= order)
    paths.set(suffix, { template, suffix, value, order });
};
