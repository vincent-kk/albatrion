import type { FieldNodeRecord } from '../../../record';

/** Annotates the lazily created `inactiveSlotChildren`; an argument-less `new Map()` would be `Map<any, any>`. */
type InactiveSlotChildren<Self> = Map<string, Self>;

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
  const live = host.childrenByName?.[name];
  if (
    live &&
    !live.isDetached &&
    (live.inactiveSlots?.size ||
      live.inactiveSlotOverlays?.size ||
      live.inactiveSlotChildren?.size)
  ) {
    const children: InactiveSlotChildren<Self> = (host.inactiveSlotChildren ??=
      new Map());
    children.set(name, live);
  } else host.inactiveSlotChildren?.delete(name);
};
