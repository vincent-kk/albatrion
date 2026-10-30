import type { InactiveSlotOverlay } from '../../../record';

/**
 * Check whether a patch without an instance retains any interpreted source.
 * @param overlay - Candidate patch whose descendants contain only supplied inputs
 * @returns Whether a raw, undeclared value, or descendant source remains
 */
export const hasSlotOverlaySource = (overlay: InactiveSlotOverlay): boolean => {
  if (overlay.raw !== undefined || overlay.undeclaredValues !== undefined)
    return true;
  for (const child of overlay.children?.values() ?? [])
    if (hasSlotOverlaySource(child)) return true;
  return false;
};
