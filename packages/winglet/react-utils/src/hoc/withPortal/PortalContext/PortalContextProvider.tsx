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

/**
 * Portal 기능을 위한 컨텍스트 프로바이더입니다.
 * Portal 컴포넌트를 사용하여 특정 DOM 위치에 콘텐츠를 렌더하는 기능을 제공합니다.
 * @param props - 프로바이더에 전달되는 자식 요소
 * @returns Portal 컨텍스트 프로바이더
 */
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
