import { parsePointerSegments } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { CandidateInput } from '../../types/candidateInput';
import type { SettlementContext } from '../../types/settlement';
import { getInactiveValuePath } from '../inactive/getInactiveValuePath';
import { markWrite } from '../input/markWrite';
import { writeSlotPath } from '../slots/writeSlotPath';
import { placeDeclarativeValue } from '../transition/placeDeclarativeValue';
import { attachCandidateInput } from './attachCandidateInput';
import { readPostPolicyInputs } from './readPostPolicyInputs';

/** Resolve a suffix against the active candidates of a returning occurrence. */
const findLive = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  suffix: string,
): Self | undefined => {
  let current: Self | undefined = node;
  for (const name of parsePointerSegments(suffix))
    current =
      typeof name === 'string' ? current?.childrenByName?.[name] : undefined;
  return current;
};

/**
 * Consume accepted exit input in original application order.
 * @param context - Settlement owning the affected source candidates
 * @param returning - Actual occurrence whose temporary exit is cancelled, when present
 * @returns Nothing; applies raw input to a returning occurrence or surviving channels after exit
 */
export const applyDepartingSource = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  returning?: Self,
): void => {
  const sources = context.retainedSources;
  if (
    !sources ||
    context.exceededBudget ||
    (returning
      ? !sources.get(returning)?.exitInputs
      : context.pendingExits.size === 0)
  )
    return;
  const accepted: { owner: Self; input: CandidateInput }[] = [];
  if (returning) {
    for (const paths of sources.get(returning)?.exitInputs?.values() ?? [])
      for (const input of paths.values())
        if (!input.isApplied) accepted.push({ owner: returning, input });
  } else {
    for (const [owner, source] of sources)
      if (owner.isDetached)
        for (const paths of source.exitInputs?.values() ?? [])
          for (const input of paths.values()) accepted.push({ owner, input });
  }
  if (!accepted.length) return;
  accepted.sort((a, b) => a.input.order - b.input.order);
  const wasAutomatic = context.isAutomatic;
  if (returning) context.isAutomatic = true;
  try {
    for (const { owner, input } of accepted) {
      if (!returning) {
        const path = getInactiveValuePath(owner, context);
        if (path !== undefined)
          for (const write of readPostPolicyInputs(input))
            writeSlotPath(
              context.root,
              path + write.suffix,
              write.template,
              write.value,
              write.isWhole,
              context,
            );
        continue;
      }
      const target = findLive(returning, input.suffix);
      if (!target) {
        sources
          .get(owner)
          ?.exitInputs?.get(input.template)
          ?.delete(input.suffix);
        placeDeclarativeValue(
          context,
          owner.path + input.suffix,
          input.template,
          input.value,
          input.order,
        );
        continue;
      }
      input.isApplied = true;
      context.hasRevivedSourceDecisions = true;
      attachCandidateInput(input, target, context);
      markWrite(
        target,
        input.value,
        context,
        undefined,
        undefined,
        'revived',
        input.order,
      );
    }
  } finally {
    context.isAutomatic = wasAutomatic;
  }
};
