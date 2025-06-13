import { type ComponentType, memo } from 'react';

import { PortalContextProvider } from './context/PortalContextProvider';

/**
 * Higher-Order Component (HOC) that wraps a component with Portal context provider.
 * Components wrapped with this HOC can use Portal components to render content at different DOM locations.
 * @typeParam T - The component props type
 * @param Component - The component to wrap with Portal context
 * @returns A memoized component wrapped with Portal context provider
 * @example
 * const MyPortalComponent = Portal.with(MyComponent);
 */
export const withPortal = <T extends object>(Component: ComponentType<T>) => {
  return memo((props: T) => (
    <PortalContextProvider>
      <Component {...props} />
    </PortalContextProvider>
  ));
};
