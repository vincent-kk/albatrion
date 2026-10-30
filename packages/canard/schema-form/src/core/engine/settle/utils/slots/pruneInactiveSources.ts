import type { FieldNodeRecord,FieldNodeRuntime } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { pruneSlotSources } from './pruneSlotSources';

/**
 * Remove sources in a general replacement scope without allocating empty slot work.
 * @param _runtime - Runtime retained for the shared source-pruner call shape
 * @param path - Absolute scope being replaced
 * @param names - Optional child scopes of a batch origin
 * @param context - Active write whose root owns retained sources
 * @returns Nothing; ordinary hosts retain only slot and overlay sources
 */
export const pruneInactiveSources = <Self extends FieldNodeRecord<Self>>(
  _runtime: FieldNodeRuntime<Self>,
  path: string,
  names?: readonly string[],
  context?: SettlementContext<Self>,
): void => {
  if (
    context &&
    (context.root.inactiveSlots?.size ||
      context.root.inactiveSlotOverlays?.size ||
      context.root.inactiveSlotChildren?.size)
  )
    pruneSlotSources(context.root, path, names, context);
};
