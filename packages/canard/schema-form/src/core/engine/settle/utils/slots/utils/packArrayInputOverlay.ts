import { map as mapArray } from '@winglet/common-utils/array';

import type { InactiveSlotOverlay } from '../../../../record';

/**
 * Keep input-only descendants inside the parent array's packed value.
 * @param overlay - Interpreted patch for a declared array position
 * @returns Patch whose descendants do not publish separate inactive values
 */
export const packArrayInputOverlay = (
  overlay: InactiveSlotOverlay,
): InactiveSlotOverlay => ({
  ...overlay,
  isPackedArrayInput: true,
  ...(overlay.children
    ? {
        children: new Map(
          mapArray([...overlay.children], ([entry, child]) => [
            entry,
            packArrayInputOverlay(child),
          ]),
        ),
      }
    : undefined),
});
