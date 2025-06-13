import { type HTMLAttributes, memo } from 'react';

import { usePortalAnchorRef } from './context/usePortalContext';

/**
 * Anchor component that specifies where Portal content will be rendered.
 * This component creates a DOM element that serves as the target for Portal rendering.
 * @param props - Properties to be passed to the underlying div element (excluding children)
 * @returns A div element that marks the location where Portal content will be rendered
 * @example
 * <Portal.Anchor className="portal-container" />
 */
export const Anchor = memo(
  (props: Omit<HTMLAttributes<HTMLDivElement>, 'children'>) => {
    const ref = usePortalAnchorRef();
    return <div {...props} ref={ref} />;
  },
);
