import { type ComponentType, memo } from 'react';

import { PortalContextProvider } from './PortalContext';

export const withPortal = <T extends object>(Component: ComponentType<T>) => {
  return memo((props: T) => (
    <PortalContextProvider>
      <Component {...props} />
    </PortalContextProvider>
  ));
};
