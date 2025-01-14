import { type PropsWithChildren, memo, useEffect } from 'react';

import { usePortalContext } from './PortalContext';

/**
 * withPortal 내부에서 Portal 컴포넌트의 자식 컴포넌트는 portalAnchor 하위에 랜더링 됩니다.
 * @param children - portalAnchor 하위에 그려질 컴포넌트
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
