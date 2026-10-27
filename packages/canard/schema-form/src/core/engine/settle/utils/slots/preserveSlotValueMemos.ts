import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getSlotEntries } from './getSlotEntries';
import { getSlotSource } from './getSlotSource';

/**
 * Carry published entry identities across a replacement of unchanged inactive input.
 * @param previous - Committed source before this settlement's first binding change
 * @param previousOverlay - Committed source patch, including input-only memos
 * @param current - Source that remains inactive at the publication boundary
 * @param overlay - Newly interpreted inactive input whose memos may be inherited
 * @returns Nothing; value equality is still checked when each memo is read
 */
export const preserveSlotValueMemos = <Self extends FieldNodeRecord<Self>>(
  previous: Self | undefined,
  previousOverlay: InactiveSlotOverlay | undefined,
  current: Self | undefined,
  overlay: InactiveSlotOverlay | undefined,
): void => {
  if (!current && !overlay) return;
  const memo = previous?.inactiveValueMemo ?? previousOverlay?.valueMemo;
  if (current && !current.inactiveValueMemo) current.inactiveValueMemo = memo;
  else if (overlay && !overlay.valueMemo) overlay.valueMemo = memo;
  for (const entry of getSlotEntries(previous, previousOverlay)) {
    const old = getSlotSource(previous, entry, previousOverlay);
    const next = getSlotSource(current, entry, overlay);
    if (next.source || next.overlay)
      preserveSlotValueMemos(
        old.source,
        old.overlay,
        next.source,
        next.overlay,
      );
  }
};
