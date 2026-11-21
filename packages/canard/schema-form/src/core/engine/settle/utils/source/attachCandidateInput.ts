import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { CandidateInput } from '../../types/candidateInput';
import type { SettlementContext } from '../../types/settlement';
import { visitInputChildren } from '../input/visitInputChildren';
import { getSlotBinding } from '../slots/getSlotBinding';
import { getSlotDecision } from './getSlotDecision';
import { getSourceBoundary } from './getSourceBoundary';
import { supersedeCandidateInput } from './supersedeCandidateInput';

/**
 * Attach the surviving named channels of an input to their actual candidate decisions.
 * @param input - Accepted original input or one of its named channel decisions
 * @param node - Live occurrence receiving the input, if already selected
 * @param context - Settlement that tracks the latest channel owners
 * @param seen - Current ancestor input identities
 * @param slot - Exact absent candidate when this input arrives through a live host
 * @returns Nothing; future writes supersede the affected channels on their own candidates
 */
export const attachCandidateInput = <Self extends FieldNodeRecord<Self>>(
  input: CandidateInput,
  node: Self | undefined,
  context: SettlementContext<Self>,
  seen = new WeakSet<object>(),
  slot?: { host: Self; entry: BlueprintChildEntry },
): void => {
  const decision = node
    ? getSourceBoundary(node, context)
    : slot &&
      getSlotDecision(
        slot.host,
        getSlotBinding(slot.host, slot.entry),
        context,
      );
  if (decision) {
    const previous = decision.postPolicyInput;
    if (previous) supersedeCandidateInput(previous, !node);
    decision.postPolicyInput = input;
  }
  if (input.template.strategy !== 'branch') return;
  visitInputChildren(
    input.template,
    input.value,
    node,
    seen,
    (name, entry, child, value) => {
      const template = child?.blueprintNode ?? entry?.node;
      if (!template || template.kind === 'virtual' || value === undefined)
        return;
      const named: CandidateInput = {
        template,
        value,
        order: input.order,
        isApplied: true,
        suffix: appendSegment(input.suffix, name),
        parent: input,
      };
      (input.children ??= []).push(named);
      attachCandidateInput(
        named,
        child,
        context,
        seen,
        !child && node && entry ? { host: node, entry } : undefined,
      );
    },
  );
};
