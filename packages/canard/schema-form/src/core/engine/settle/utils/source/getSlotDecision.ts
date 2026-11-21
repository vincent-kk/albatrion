import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type {
  RetainedSlotSource,
  SettlementContext,
} from '../../types/settlement';
import { getSourceBoundary } from './getSourceBoundary';

/**
 * Read or allocate the decision for one exact candidate.
 * @param host - Actual owner of the candidate
 * @param entry - Already resolved candidate binding
 * @param context - Active settlement
 * @returns The candidate's working decision and optional rollback boundary
 */
export const getSlotDecision = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  entry: BlueprintChildEntry,
  context: SettlementContext<Self>,
): RetainedSlotSource<Self> => {
  const source = getSourceBoundary(host, context);
  const slots: Map<
    BlueprintChildEntry,
    RetainedSlotSource<Self>
  > = (source.slots ??= new Map());
  let decision = slots.get(entry);
  if (!decision) slots.set(entry, (decision = {}));
  return decision;
};
