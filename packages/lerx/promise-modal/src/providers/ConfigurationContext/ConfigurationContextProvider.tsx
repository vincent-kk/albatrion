import {
  type ComponentType,
  type PropsWithChildren,
  memo,
  useMemo,
} from 'react';

import type { Color, Duration } from '@aileron/types';

import {
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_BACKDROP_COLOR,
} from '@/promise-modal/app/constant';
import {
  FallbackContent,
  FallbackFooter,
  FallbackForegroundFrame,
  FallbackSubtitle,
  FallbackTitle,
} from '@/promise-modal/components/FallbackComponents';
import type {
  FooterComponentProps,
  ModalFrameProps,
  WrapperComponentProps,
} from '@/promise-modal/types';

import { ConfigurationContext } from './ConfigurationContext';

interface ConfigurationContextProviderProps {
  BackgroundComponent?: ComponentType<ModalFrameProps>;
  ForegroundComponent?: ComponentType<ModalFrameProps>;
  TitleComponent?: ComponentType<WrapperComponentProps>;
  SubtitleComponent?: ComponentType<WrapperComponentProps>;
  ContentComponent?: ComponentType<WrapperComponentProps>;
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
}

export const ConfigurationContextProvider = memo(
  ({
    ForegroundComponent,
    BackgroundComponent,
    TitleComponent,
    SubtitleComponent,
    ContentComponent,
    FooterComponent,
    options,
    children,
  }: PropsWithChildren<ConfigurationContextProviderProps>) => {
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
        } satisfies ConfigurationContextProviderProps['options'],
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
      <ConfigurationContext.Provider value={value}>
        {children}
      </ConfigurationContext.Provider>
    );
  },
);
