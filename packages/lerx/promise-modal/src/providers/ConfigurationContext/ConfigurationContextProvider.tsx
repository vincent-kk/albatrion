import {
  type ComponentType,
  type PropsWithChildren,
  memo,
  useMemo,
} from 'react';

import { useConstant, useSnapshot } from '@winglet/react-utils/hook';

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
  ModalOptions,
  WrapperComponentProps,
} from '@/promise-modal/types';

import { ConfigurationContext } from './ConfigurationContext';

const DEFAULT_OPTIONS = {
  duration: DEFAULT_ANIMATION_DURATION,
  backdrop: DEFAULT_BACKDROP_COLOR,
  closeOnBackdropClick: true,
  manualDestroy: false,
} satisfies Required<ModalOptions>;

export interface ConfigurationContextProviderProps {
  BackgroundComponent?: ComponentType<ModalFrameProps>;
  ForegroundComponent?: ComponentType<ModalFrameProps>;
  TitleComponent?: ComponentType<WrapperComponentProps>;
  SubtitleComponent?: ComponentType<WrapperComponentProps>;
  ContentComponent?: ComponentType<WrapperComponentProps>;
  FooterComponent?: ComponentType<FooterComponentProps>;
  options?: ModalOptions;
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
    const constant = useConstant({
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
        ForegroundComponent: constant.ForegroundComponent,
        BackgroundComponent: constant.BackgroundComponent,
        TitleComponent: constant.TitleComponent,
        SubtitleComponent: constant.SubtitleComponent,
        ContentComponent: constant.ContentComponent,
        FooterComponent: constant.FooterComponent,
        options: {
          ...DEFAULT_OPTIONS,
          ...options,
        } satisfies ConfigurationContextProviderProps['options'],
      }),
      [constant, options],
    );
    return (
      <ConfigurationContext.Provider value={value}>
        {children}
      </ConfigurationContext.Provider>
    );
  },
);
