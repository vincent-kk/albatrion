import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';

/**
 * Compare a re-read input's sequence with the input already accepted by its actual binding.
 * @param node - The current occurrence receiving the distribution
 * @param context - Active settlement, whose sequence is local to this write segment
 * @param order - Original application order, when the input is sequenced
 * @returns Whether this input can own the binding without overwriting a newer write
 */
export const acceptsRetainedWrite = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  order?: number,
): boolean =>
  order === undefined ||
  (context.retainedSources?.get(node)?.writeOrder ?? 0) <= order;
