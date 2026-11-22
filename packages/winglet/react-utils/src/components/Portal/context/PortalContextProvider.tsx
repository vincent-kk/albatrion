import { type ContextType, type PropsWithChildren, useState } from 'react';

import { PortalContext } from './PortalContext';

/**
 * Shares the current anchor without taking ownership of portal children.
 * @param children - The source React tree containing portals and its anchor
 * @returns A provider whose stable context state changes only with the destination
 */
export const PortalContextProvider = ({ children }: PropsWithChildren) => {
  const [value, setValue] = useState<
    NonNullable<ContextType<typeof PortalContext>>
  >(() => ({
    anchor: null,
    setPortalAnchor: (action) =>
      setValue((current) => {
        const anchor =
          typeof action === 'function' ? action(current.anchor) : action;
        return anchor === current.anchor ? current : { ...current, anchor };
      }),
  }));
  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
};
