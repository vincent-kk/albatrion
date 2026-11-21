import type { Optional } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { Distribution, FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { isWithinReplacementPaths } from './isWithinReplacementPaths';

/**
 * Read a child input without redistributing a restored candidate-owned array slot.
 * A declarative (automatic) distribution replaces its own target whole, so it applies inside or
 * outside a multi-write batch's caller replacement paths; the evidence lives in the distribution
 * record, which a derive rollback restores with it.
 * @param host - Parent whose current write may own the child input
 * @param name - Unescaped declared child name or array position
 * @param context - Replacement scopes and host distributions for this settlement
 * @param path - Existing child path when the caller already owns it; otherwise composed only for batch scope checks
 * @param distribution - Optional boundary distribution read instead of the working input
 * @returns The applicable distribution, or undefined when the child restores its own source
 */
export const getChildDistribution = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  name: string,
  context: SettlementContext<Self>,
  path?: string,
  distribution = context.distributedInputs.get(host),
): Optional<Distribution> => {
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
  return (distribution.retainedItemNames?.indexOf(name) ?? -1) !== -1
    ? undefined
    : distribution;
};
