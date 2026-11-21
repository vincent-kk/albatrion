import type { PropsWithChildren, ReactPortal } from 'react';

import { createPortal } from 'react-dom';

import { usePortalContext } from './context/usePortalContext';
import { type PortalComponent, memoizePortal } from './utils/memoizePortal';

/**
 * Renders children into the current anchor while preserving their source React ancestry.
 * @param children - Content placed at Portal.Anchor once its DOM node attaches
 * @returns A React portal, or null while no anchor is mounted, including server rendering
 */
export const Portal: PortalComponent = memoizePortal(
  ({ children }: PropsWithChildren): ReactPortal | null => {
    const { anchor } = usePortalContext();
    return anchor ? createPortal(children, anchor) : null;
  },
);
