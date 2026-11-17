import { type PropsWithChildren, useEffect } from 'react';

import { VirtualizationContext } from './VirtualizationContext';

/** FormRoot owns creation so focus requests and input positions share the same manager. */
interface VirtualizationContextProviderProps {
  /** Stable mount-time value supplied by FormRoot. */
  value: VirtualizationContext;
}

/** Share the supplied manager and release observation when this provider disconnects. */
export const VirtualizationContextProvider = ({
  value,
  children,
}: PropsWithChildren<VirtualizationContextProviderProps>) => {
  const manager = value.manager;
  useEffect(() => {
    if (manager === null) return;
    return () => manager.disconnect();
  }, [manager]);
  return (
    <VirtualizationContext.Provider value={value}>
      {children}
    </VirtualizationContext.Provider>
  );
};
