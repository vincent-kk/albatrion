import type { BlueprintChildEntry } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import type { RevivedSlotSource } from '../../../types/departingWrite';
import type { SettlementContext } from '../../../types/settlement';
import { getSlotBinding } from '../../slots/getSlotBinding';
import { getSourceBoundary } from '../../source/getSourceBoundary';
import { supersedeRevivedSlotSource } from './supersedeRevivedSlotSource';

/**
 * Attach a revived input's right to an inactive candidate of a live owner.
 * @param host - Live owner of the candidate during the cancelled exit
 * @param entry - Declaration receiving the explicit input
 * @param right - Named value eligible to follow the final exit policy
 * @param context - Settlement that owns the candidate and its binding lifetime
 * @returns Nothing; a later whole replacement of this candidate can supersede the right
 */
export const recordRevivedChildSource = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  entry: BlueprintChildEntry,
  right: RevivedSlotSource<Self>,
  context: SettlementContext<Self>,
): void => {
  const source = getSourceBoundary(host, context);
  const binding = getSlotBinding(host, entry);
  const rights: Map<
    BlueprintChildEntry,
    RevivedSlotSource<Self>
  > = (source.revivedChildSources ??= new Map());
  const preceding = rights.get(binding);
  if (preceding) supersedeRevivedSlotSource(preceding, true);
  rights.set(binding, right);
};
