import { useContext } from 'react';

import { PortalContext } from './PortalContext';

/**
 * Provides access to the Portal context for managing portal content registration and rendering.
 *
 * This hook returns the Portal context that contains all the necessary functions and references
 * for Portal components to register themselves and for Anchor components to provide rendering
 * targets. It includes registration/unregistration functions and the DOM anchor reference.
 * The hook enforces that Portal components are used within a proper Portal context provider.
 *
 * @throws {Error} When used outside of a PortalContextProvider
 * @returns The portal context containing registration functions and anchor reference
 */
export const usePortalContext = () => {
  const context = useContext(PortalContext);
  if (!context)
    throw new Error('PortalContext must be used within a PortalProvider');
  return context;
};

/**
 * Provides the DOM reference where Portal content will be rendered.
 *
 * This hook returns a ref object that should be attached to the DOM element designated
 * as the portal anchor. The ref creates the connection between the logical Portal.Anchor
 * component and the physical DOM location where all portal content will be rendered.
 * It's specifically designed for use within Portal.Anchor components.
 *
 * @returns A ref object that should be attached to the DOM element serving as the portal anchor
 */
export const usePortalAnchorRef = () => usePortalContext().portalAnchorRef;
