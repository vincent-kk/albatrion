import {
  Fragment,
  type PropsWithChildren,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from 'react';

import { createPortal } from 'react-dom';

import { getRandomString, map } from '@winglet/common-utils';

import { PortalContext } from './PortalContext';

export const PortalContextProvider = ({ children }: PropsWithChildren) => {
  const [components, setComponents] = useState<
    { id: string; element: ReactNode }[]
  >([]);

  const portalAnchorRef = useRef<HTMLDivElement>(null);

  const value = useMemo(
    () => ({
      portalAnchorRef,
      register: (element: ReactNode): string => {
        const id = getRandomString(36);
        setComponents((previous) => [...previous, { id, element }]);
        return id;
      },
      unregister: (id: string) => {
        setComponents((previous) =>
          previous.filter((component) => component.id !== id),
        );
      },
    }),
    [],
  );

  return (
    <PortalContext.Provider value={value}>
      {children}
      {portalAnchorRef.current &&
        createPortal(
          <Fragment>
            {map(components, ({ id, element }) => (
              <Fragment key={id}>{element}</Fragment>
            ))}
          </Fragment>,
          portalAnchorRef.current,
        )}
    </PortalContext.Provider>
  );
};
