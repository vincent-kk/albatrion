import { ComponentType, type PropsWithChildren, useMemo, useRef } from 'react';

import { createPortal } from 'react-dom';

import { useOnMount, useTick } from '@lumy-pack/common-react';

import {
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_BACKDROP_COLOR,
} from '@/promise-modal/app/constant';
import { Anchor } from '@/promise-modal/components/Anchor';
import {
  FallbackContent,
  FallbackFooter,
  FallbackForegroundFrame,
  FallbackSubtitle,
  FallbackTitle,
} from '@/promise-modal/components/FallbackComponents';
import { createAnchor } from '@/promise-modal/helpers/createAnchor';
import { usePathname as useDefaultPathname } from '@/promise-modal/hooks/useDefaultPathname';
import type {
  FooterComponentProps,
  ModalFrameProps,
} from '@/promise-modal/types';

import { ModalContext } from './ModalContext';

interface ModalContextProviderProps {
  BackgroundComponent?: ComponentType<ModalFrameProps>;
  ForegroundComponent?: ComponentType<ModalFrameProps>;
  TitleComponent?: ComponentType<PropsWithChildren>;
  SubtitleComponent?: ComponentType<PropsWithChildren>;
  ContentComponent?: ComponentType<PropsWithChildren>;
  FooterComponent?: ComponentType<FooterComponentProps>;
  options?: {
    /** Modal transition time(ms, s) */
    duration?: `${number}ms` | `${number}s`;
    /** Modal backdrop color */
    backdrop?: Color;
  };
  usePathname?: () => { pathname: string };
}

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
}: PropsWithChildren<ModalContextProviderProps>) => {
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

  const value = useMemo(
    () => ({
      BackgroundComponent,
      ForegroundComponent: ForegroundComponent || FallbackForegroundFrame,
      TitleComponent: TitleComponent || FallbackTitle,
      SubtitleComponent: SubtitleComponent || FallbackSubtitle,
      ContentComponent: ContentComponent || FallbackContent,
      FooterComponent: FooterComponent || FallbackFooter,
      options: {
        duration: DEFAULT_ANIMATION_DURATION,
        backdrop: DEFAULT_BACKDROP_COLOR,
        ...options,
      } satisfies ModalContextProviderProps['options'],
    }),
    [
      ForegroundComponent,
      BackgroundComponent,
      ContentComponent,
      FooterComponent,
      SubtitleComponent,
      TitleComponent,
      options,
    ],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      {portalRef.current &&
        createPortal(<Anchor pathname={pathname} />, portalRef.current)}
    </ModalContext.Provider>
  );
};
