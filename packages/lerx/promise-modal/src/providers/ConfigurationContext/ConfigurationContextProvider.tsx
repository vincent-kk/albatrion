import {
  type ComponentType,
  type PropsWithChildren,
  memo,
  useMemo,
} from 'react';

import { useMemorize, useSnapshot } from '@winglet/react-utils/hook';

import type { Color, Duration } from '@aileron/declare';

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

const DEFAULT_OPTIONS = {
  duration: DEFAULT_ANIMATION_DURATION,
  backdrop: DEFAULT_BACKDROP_COLOR,
  closeOnBackdropClick: true,
  manualDestroy: false,
};

export interface ConfigurationContextProviderProps {
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
    options: inputOptions,
    children,
  }: PropsWithChildren<ConfigurationContextProviderProps>) => {
    const memoized = useMemorize({
      BackgroundComponent,
      ForegroundComponent: ForegroundComponent || FallbackForegroundFrame,
      TitleComponent: TitleComponent || FallbackTitle,
      SubtitleComponent: SubtitleComponent || FallbackSubtitle,
      ContentComponent: memo(ContentComponent || FallbackContent),
      FooterComponent: memo(FooterComponent || FallbackFooter),
    });
    const options = useSnapshot(inputOptions);

    const value = useMemo(
      () => ({
        ForegroundComponent: memoized.ForegroundComponent,
        BackgroundComponent: memoized.BackgroundComponent,
        TitleComponent: memoized.TitleComponent,
        SubtitleComponent: memoized.SubtitleComponent,
        ContentComponent: memoized.ContentComponent,
        FooterComponent: memoized.FooterComponent,
        options: {
          ...DEFAULT_OPTIONS,
          ...options,
        } satisfies ConfigurationContextProviderProps['options'],
      }),
      [memoized, options],
    );
    return (
      <ConfigurationContext.Provider value={value}>
        {children}
      </ConfigurationContext.Provider>
    );
  },
);
