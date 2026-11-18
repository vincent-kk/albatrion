import { type PropsWithChildren, memo } from 'react';
import { createPortal } from 'react-dom';

import { usePortalContext } from './context/usePortalContext';

/**
 * Renders children into the current anchor while preserving their source React ancestry.
 * @param children - Content placed at Portal.Anchor once its DOM node attaches
 * @returns A React portal, or null while no anchor is mounted, including server rendering
 */
export const Portal = memo(({ children }: PropsWithChildren) => {
  const { anchor } = usePortalContext();
  return anchor ? createPortal(children, anchor) : null;
});
