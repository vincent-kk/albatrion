import type { Optional } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { Distribution, FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getSlotBinding } from '../slots/getSlotBinding';
import { isWithinReplacementPaths } from './isWithinReplacementPaths';

/**
 * Read a child input without redistributing a restored candidate-owned array slot.
 * A declarative (automatic) distribution replaces its own target whole, so it applies inside or
 * outside a multi-write batch's caller replacement paths; the evidence lives in the distribution
 * record, which a derive rollback restores with it.
 * @param host - Parent whose current write may own the child input
 * @param candidate - Selected binding or an unselected array position
 * @param context - Replacement scopes and host distributions for this settlement
 * @param path - Existing child path when the caller already owns it; otherwise composed only for batch scope checks
 * @param distribution - Optional boundary distribution read instead of the working input
 * @returns The applicable distribution, or undefined when the child restores its own source
 */
export const getChildDistribution = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  candidate: string | BlueprintChildEntry,
  context: SettlementContext<Self>,
  path?: string,
  distribution = context.distributedInputs.get(host),
): Optional<Distribution> => {
  const entry = typeof candidate === 'string' ? undefined : candidate;
  const name = typeof candidate === 'string' ? candidate : candidate.name;
  if (
    distribution === undefined ||
    (context.writeOrigins !== undefined &&
      !distribution.isAutomatic &&
      !isWithinReplacementPaths(
        context,
        path ?? appendSegment(host.path, name),
      ))
  )
    return undefined;
  if (entry && !context.exceededBudget) {
    const retained = context.retainedSources?.get(host);
    const order = distribution.writeOrder ?? 0;
    if (
      retained?.latestSlotWriteOrder !== undefined &&
      retained.latestSlotWriteOrder > order
    ) {
      const decisions = retained.slots;
      const slot =
        decisions?.get(entry) ?? decisions?.get(getSlotBinding(host, entry));
      if ((slot?.writeOrder ?? 0) > order) return undefined;
    }
  }
  return (distribution.retainedItemNames?.indexOf(name) ?? -1) !== -1
    ? undefined
    : distribution;
};
