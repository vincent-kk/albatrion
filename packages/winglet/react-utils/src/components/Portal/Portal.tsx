import { type PropsWithChildren, memo, useEffect } from 'react';

import { usePortalContext } from './PortalContext';

/**
 * Portal component renders its children under the portalAnchor within a withPortal HOC.
 * Content passed to this component will be rendered at the location of the Portal.Anchor.
 * @param children - The components to be rendered under the portalAnchor
 */
export const Portal = memo(({ children }: PropsWithChildren) => {
  const { register, unregister } = usePortalContext();
  useEffect(() => {
    const id = register(children);
    return () => {
      if (id) unregister(id);
    };
  }, [children, register, unregister]);
  return null;
});
