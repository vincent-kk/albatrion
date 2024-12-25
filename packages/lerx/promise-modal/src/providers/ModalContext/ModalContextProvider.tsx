import {
  type ComponentType,
  type PropsWithChildren,
  memo,
  useMemo,
  useRef,
} from 'react';

import { createPortal } from 'react-dom';

import { useOnMount, useTick } from '@winglet/react-utils';

import { ModalManager } from '@/promise-modal/app/ModalManager';
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
import { usePathname as useDefaultPathname } from '@/promise-modal/hooks/useDefaultPathname';
import type {
  FooterComponentProps,
  ModalFrameProps,
} from '@/promise-modal/types';

import { ModalDataContextProvider } from '../ModalDataContext';
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
    duration?: Duration;
    /** Modal backdrop color */
    backdrop?: Color;
    /** Whether to destroy the modal manually */
    manualDestroy?: boolean;
    /** Whether to close the modal when the backdrop is clicked */
    closeOnBackdropClick?: boolean;
  };
  usePathname?: () => { pathname: string };
}

export const ModalContextProvider = memo(
  ({
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
      portalRef.current = ModalManager.anchor('div');
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
        ContentComponent: memo(ContentComponent || FallbackContent),
        FooterComponent: memo(FooterComponent || FallbackFooter),
        options: {
          duration: DEFAULT_ANIMATION_DURATION,
          backdrop: DEFAULT_BACKDROP_COLOR,
          closeOnBackdropClick: true,
          manualDestroy: false,
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
          createPortal(
            <ModalDataContextProvider pathname={pathname}>
              <Anchor />
            </ModalDataContextProvider>,
            portalRef.current,
          )}
      </ModalContext.Provider>
    );
  },
);
