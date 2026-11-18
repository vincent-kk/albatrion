import { type PropsWithChildren, useMemo, useState } from 'react';

import { PortalContext } from './PortalContext';

/**
 * Shares the current anchor without taking ownership of portal children.
 * @param children - The source React tree containing portals and its anchor
 * @returns A provider whose anchor state follows callback-ref attachment and replacement
 */
export const PortalContextProvider = ({ children }: PropsWithChildren) => {
  const [anchor, setPortalAnchor] = useState<HTMLDivElement | null>(null);
  const value = useMemo(() => ({ anchor, setPortalAnchor }), [anchor]);
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};
