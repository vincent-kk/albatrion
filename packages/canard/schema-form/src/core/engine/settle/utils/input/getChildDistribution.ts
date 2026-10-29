import type { Optional } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { Distribution, FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { isWithinReplacePaths } from './isWithinReplacePaths';

/**
 * Read a child input without redistributing a restored candidate-owned array slot.
 * @param host - Parent whose current write may own the child input
 * @param name - Unescaped declared child name or array position
 * @param context - Replacement scopes and host distributions for this settlement
 * @param path - Existing child path when the caller already owns it; otherwise composed only for batch scope checks
 * @returns The applicable distribution, or undefined when the child restores its own source
 */
export const getChildDistribution = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  name: string,
  context: SettlementContext<Self>,
  path?: string,
): Optional<Distribution> => {
  if (
    context.replacePaths !== undefined &&
    !isWithinReplacePaths(context, path ?? appendSegment(host.path, name))
  )
    return undefined;
  const distribution = context.distributedInputs.get(host);
  return (distribution?.retainedItemNames?.indexOf(name) ?? -1) !== -1
    ? undefined
    : distribution;
};
