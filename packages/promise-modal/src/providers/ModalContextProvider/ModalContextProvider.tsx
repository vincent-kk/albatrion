import { type PropsWithChildren, useRef } from 'react';

import { createPortal } from 'react-dom';

import { useOnMount, useTick } from '@lumy-pack/common-react';

import {
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_BACKDROP_COLOR,
} from '@/promise-modal/app/constant';
import { Anchor } from '@/promise-modal/components/Anchor';
import { createAnchor } from '@/promise-modal/helpers/createAnchor';
import { usePathname as useDefaultPathname } from '@/promise-modal/hooks/useDefaultPathname';

import { ModalContext } from './ModalContext';
import type { ModalProviderProps } from './type';

export const ModalContextProvider = ({
  ForegroundComponent,
  BackgroundComponent,
  TitleComponent,
  SubtitleComponent,
  ContentComponent,
  FooterComponent,
  options,
  usePathname,
  children,
}: PropsWithChildren<ModalProviderProps>) => {
  const { pathname } = (usePathname || useDefaultPathname)();
  const [, update] = useTick();
  const portalRef = useRef<HTMLElement | null>(null);

  useOnMount(() => {
    portalRef.current = createAnchor('div');
    update();
    return () => {
      if (portalRef.current) {
        portalRef.current.remove();
      }
    };
  });

  return (
    <ModalContext.Provider
      value={{
        ForegroundComponent,
        BackgroundComponent,
        TitleComponent,
        SubtitleComponent,
        ContentComponent,
        FooterComponent,
        options: {
          duration: DEFAULT_ANIMATION_DURATION,
          backdrop: DEFAULT_BACKDROP_COLOR,
          ...options,
        },
      }}
    >
      {children}
      {portalRef.current &&
        createPortal(<Anchor pathname={pathname} />, portalRef.current)}
    </ModalContext.Provider>
  );
};
