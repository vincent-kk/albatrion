import type { FieldNodeRecord, FieldNodeRuntime } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { pruneLiteralStarRaw } from '../literalStarStore/pruneLiteralStarRaw';
import { pruneSlotSources } from './pruneSlotSources';

/**
 * Remove sources in a general replacement scope without allocating empty slot work.
 * @param runtime - Fixed form blueprint and optional literal-star storage
 * @param path - Absolute scope being replaced
 * @param names - Optional child scopes of a batch origin
 * @param context - Active write whose root owns retained sources
 * @returns Nothing; ordinary hosts retain only slot and overlay sources
 */
export const pruneInactiveSources = <Self extends FieldNodeRecord<Self>>(
  runtime: FieldNodeRuntime<Self>,
  path: string,
  names?: readonly string[],
  context?: SettlementContext<Self>,
): void => {
  if (runtime.blueprint.root.containsLiteralStar === true) {
    pruneLiteralStarRaw(runtime, path, names, context);
    return;
  }
  if (
    context &&
    (context.root.inactiveSlots?.size ||
      context.root.inactiveSlotOverlays?.size ||
      context.root.inactiveSlotChildren?.size)
  )
    pruneSlotSources(context.root, path, names, context);
};
