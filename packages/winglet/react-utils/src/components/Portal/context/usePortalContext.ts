import { useContext } from 'react';

import { PortalContext } from './PortalContext';

/**
 * Reads the current anchor and stable callback supplied by Portal.with.
 * @throws {Error} When called outside Portal.with
 * @returns The current destination node and its attachment callback
 */
export const usePortalContext = () => {
  const context = useContext(PortalContext);
  if (!context)
    throw new Error('PortalContext must be used within a PortalProvider');
  return context;
};

/** Returns the stable callback ref used to attach or replace Portal.Anchor. */
export const usePortalAnchor = () => usePortalContext().setPortalAnchor;
