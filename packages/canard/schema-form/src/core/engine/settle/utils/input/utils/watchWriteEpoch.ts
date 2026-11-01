import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { DirtyPathSet } from '../../scratch/DirtyPathSet';

/**
 * Mirror the general marking path independently of actual node generations.
 * @param context - Verify-only admitted whole write, before its first input mark
 * @returns Nothing; scratch cleanup restores the input map even on an exception
 */
export const watchWriteEpoch = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const dirty = context.dirtyPaths;
  if (!(dirty instanceof DirtyPathSet)) return;
  const shadow = (context.writeEpochShadow = new DirtyPathSet(new Map()));
  shadow.beginPostOrder();
  const inputs = context.writtenInputs;
  const set = inputs.set;
  const restore = dirty.restoreRegistrationObserver;
  inputs.set = function (node, value) {
    shadow.add(node.path);
    return set.call(this, node, value);
  };
  dirty.restoreRegistrationObserver = () => {
    inputs.set = set;
    restore?.();
  };
};
