import type { FieldNodeRecord } from '../../../record';

/** Annotates the lazily created `__inactiveSlotChildren__`; an argument-less `new Map()` would be `Map<any, any>`. */
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
  const live = host.__childrenByName__?.[name];
  if (
    live &&
    !live.isDetached &&
    (live.__inactiveSlots__?.size ||
      live.__inactiveSlotOverlays__?.size ||
      live.__inactiveSlotChildren__?.size)
  ) {
    const children: InactiveSlotChildren<Self> =
      (host.__inactiveSlotChildren__ ??= new Map());
    children.set(name, live);
  } else host.__inactiveSlotChildren__?.delete(name);
};
