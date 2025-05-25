import { useContext } from 'react';

import { PortalContext } from './PortalContext';

/**
 * Returns the PortalContext.
 * @returns The portal context
 */
export const usePortalContext = () => {
  const context = useContext(PortalContext);
  if (!context)
    throw new Error('PortalContext must be used within a PortalProvider');
  return context;
};

/**
 * Returns a ref that should be attached to the DOM element where Portal content will be rendered.
 * This ref connects the Portal components to their designated anchor point.
 * @returns The portal anchor ref
 */
export const usePortalAnchorRef = () => {
  const { portalAnchorRef } = usePortalContext();
  return portalAnchorRef;
};
