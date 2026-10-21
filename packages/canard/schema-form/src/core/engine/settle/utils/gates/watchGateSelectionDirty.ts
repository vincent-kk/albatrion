import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { verifyGateSelection } from './verifyGateSelection';

/**
 * Observe every verify-mode dirty insertion, including transient add/delete pairs.
 * @param context - Settlement owning the eligible round map and reusable dirty set
 * @returns Nothing; the outer compute finally restores the original method
 */
export const watchGateSelectionDirty = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  if (context.restoreGateSelectionDirty) return;
  const dirty = context.dirtyPaths;
  const add = dirty.add;
  dirty.add = function (path: string) {
    for (const round of context.gateSelectionRounds?.values() ?? [])
      if (round.active)
        verifyGateSelection(
          !round.watchedPaths.includes(path),
          'S2 watched path became dirty: ' + path,
        );
    return add.call(this, path);
  };
  context.restoreGateSelectionDirty = () => {
    dirty.add = add;
    context.restoreGateSelectionDirty = undefined;
  };
};
