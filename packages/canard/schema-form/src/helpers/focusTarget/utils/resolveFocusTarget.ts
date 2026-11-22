import { FOCUS_SELECTOR } from '@/schema-form/constants/focus';

import type { FocusAnchor } from '../types/position';
import { isFocusElement } from './isFocusElement';

/**
 * Read the connected anchor or the first DOM fallback.
 * @param container - Fallback scope, or null to consider only the anchor.
 * @param anchor - Current target from the input's ref.
 * @param owner - Owning document when looking up an anchor without a fallback scope.
 * @returns The focus target, or null when none is eligible.
 */
export const resolveFocusTarget = (
  container: Element | null,
  anchor: FocusAnchor | null,
  owner?: Document,
): FocusAnchor | null => {
  if (
    anchor &&
    (!isFocusElement(anchor) ||
      (anchor.isConnected &&
        anchor.ownerDocument === (owner ?? container?.ownerDocument)))
  )
    return anchor;
  return container?.querySelector<HTMLElement>(FOCUS_SELECTOR) ?? null;
};
