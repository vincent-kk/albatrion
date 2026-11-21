import type { DeriveRoundDecision } from '../../../../derive';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { isLiveOccurrence } from '../../transition/isLiveOccurrence';
import { selectNamedRetainedSources } from './retainedSources/selectNamedRetainedSources';

/**
 * Select named channels of an accepted rule whose working output already matches.
 * @param write - Winner that passed rule resolution and value comparison
 * @param context - Settlement that may still withdraw a fill or replay a revived right
 * @returns Nothing; retention choices change without scheduling a computation
 */
export const retainEqualDeriveWrite = <Self extends FieldNodeRecord<Self>>(
  write: DeriveRoundDecision<Self>['writes'][number],
  context: SettlementContext<Self>,
): void => {
  const target = write.target;
  if (
    !target ||
    (!context.filledNodes.size && !context.hasRevivedSourceDecisions) ||
    !isLiveOccurrence(target, context)
  )
    return;
  const order = (context.retainedWriteOrder =
    (context.retainedWriteOrder ?? 0) + 1);
  selectNamedRetainedSources(target, write.value, context, order);
};
