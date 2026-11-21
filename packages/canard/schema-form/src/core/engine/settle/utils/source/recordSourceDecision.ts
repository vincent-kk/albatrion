import type { Distribution, FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getSourceBoundary } from './getSourceBoundary';
import { supersedeCandidateInput } from './supersedeCandidateInput';

/**
 * Record one accepted live input and its choice of exit channels.
 * @param node - Exact selected occurrence
 * @param input - Original input, available for later reinterpretation
 * @param context - Settlement owning Source B and candidate decisions
 * @param origin - Named rule or revival, when supplied
 * @param order - Actual acceptance order
 * @param isOutputEqual - The input changes only the decision, without rewriting channels
 * @returns Nothing; equal output does not schedule computation or Refresh
 */
export const recordSourceDecision = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  input: unknown,
  context: SettlementContext<Self>,
  origin: Distribution['writeOrigin'],
  order: number,
  isOutputEqual = false,
): void => {
  const retained = isOutputEqual
    ? context.retainedSources?.get(node)
    : getSourceBoundary(node, context);
  if (!retained) return;
  const previous = retained.postPolicyInput;
  if (
    previous &&
    previous.order < order &&
    (isOutputEqual || context.isMarkingLiveRule || origin === 'revived')
  )
    supersedeCandidateInput(previous);
  if (isOutputEqual && !retained.shouldUseBaseline) return;
  if (origin !== undefined) {
    context.filledNodes.delete(node);
    context.writtenInputs.set(node, input);
  }
  if (!isOutputEqual) retained.hasAutomaticWrite = true;
  retained.writeOrder = order;
  retained.writeOrigin = origin;
  retained.shouldUseBaseline = context.filledNodes.has(node);
};
