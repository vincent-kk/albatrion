import type { FieldNodeRecord } from '../../../record';

/**
 * Keep one live child branch in its owner's inactive-source read index.
 * @param host - Live parent whose source-bearing child references are updated
 * @param name - Child name changed by selection or descendant publication
 * @returns Nothing; empty, detached, and replaced children release their old links
 */
export const updateSlotChildIndex = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  name: string,
): void => {
  const live = host.structure?.[name];
  if (
    live &&
    !live.detached &&
    (live.inactiveSlots?.size ||
      live.inactiveSlotOverlays?.size ||
      live.inactiveSlotChildren?.size)
  )
    (host.inactiveSlotChildren ??= new Map()).set(name, live);
  else host.inactiveSlotChildren?.delete(name);
};
