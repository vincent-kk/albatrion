import {
  type CSSProperties,
  type ComponentType,
  type PropsWithChildren,
  memo,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { isPlainObject, isString } from '@winglet/common-utils/filter';
import { useMemorize, useSnapshot } from '@winglet/react-utils/hook';

import {
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_BACKDROP_COLOR,
  DEFAULT_Z_INDEX,
} from '@/promise-modal/app';
import {
  FallbackContent,
  FallbackFooter,
  FallbackForegroundFrame,
  FallbackSubtitle,
  FallbackTitle,
} from '@/promise-modal/components/FallbackComponents';
import { mergeDefined } from '@/promise-modal/helpers/mergeDefined';
import { normalizeDuration } from '@/promise-modal/helpers/normalizeDuration';
import type {
  FooterComponentProps,
  ModalFrameProps,
  ModalOptions,
  WrapperComponentProps,
} from '@/promise-modal/types';

import {
  ConfigurationContext,
  type ConfigurationContextProps,
} from './ConfigurationContext';

const DEFAULT_OPTIONS = {
  zIndex: DEFAULT_Z_INDEX,
  duration: DEFAULT_ANIMATION_DURATION,
  backdrop: { backgroundColor: DEFAULT_BACKDROP_COLOR },
  closeOnBackdropClick: true,
  manualDestroy: false,
} satisfies Required<ConfigurationContextProps['options']>;

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
    const initialComponents = useMemorize(() => ({
      ForegroundComponent,
      BackgroundComponent,
      TitleComponent,
      SubtitleComponent,
      ContentComponent,
      FooterComponent,
    }));
    const warned = useRef(new Set<string>());
    useEffect(() => {
      if (process.env.NODE_ENV === 'production') return;
      const current = {
        ForegroundComponent,
        BackgroundComponent,
        TitleComponent,
        SubtitleComponent,
        ContentComponent,
        FooterComponent,
      };
      for (const name of Object.keys(current) as Array<keyof typeof current>) {
        if (
          current[name] === initialComponents[name] ||
          warned.current.has(name)
        )
          continue;
        warned.current.add(name);
        console.warn(
          `[promise-modal] ${name} is fixed at mount; pass changing data through context instead.`,
        );
      }
    }, [
      ForegroundComponent,
      BackgroundComponent,
      TitleComponent,
      SubtitleComponent,
      ContentComponent,
      FooterComponent,
      initialComponents,
    ]);
    const constant = useMemorize(() => ({
      BackgroundComponent,
      ForegroundComponent: ForegroundComponent || FallbackForegroundFrame,
      TitleComponent: TitleComponent || FallbackTitle,
      SubtitleComponent: SubtitleComponent || FallbackSubtitle,
      ContentComponent: memo(ContentComponent || FallbackContent),
      FooterComponent: memo(FooterComponent || FallbackFooter),
    }));
    const options = useSnapshot(inputOptions);

    const value = useMemo(() => {
      const { backdrop: defaultBackdrop, ...defaultOptions } = DEFAULT_OPTIONS;
      const backdrop = getBackdropStyle(options?.backdrop, defaultBackdrop);
      return {
        ForegroundComponent: constant.ForegroundComponent,
        BackgroundComponent: constant.BackgroundComponent,
        TitleComponent: constant.TitleComponent,
        SubtitleComponent: constant.SubtitleComponent,
        ContentComponent: constant.ContentComponent,
        FooterComponent: constant.FooterComponent,
        options: {
          ...mergeDefined(defaultOptions, options ?? {}),
          backdrop,
          duration: normalizeDuration(
            options?.duration,
            DEFAULT_ANIMATION_DURATION,
          ),
        },
      };
    }, [constant, options]);
    return (
      <ConfigurationContext.Provider value={value}>
        {children}
      </ConfigurationContext.Provider>
    );
  },
);

const getBackdropStyle = (
  backdrop: ModalOptions['backdrop'],
  defaultBackdrop: CSSProperties,
): CSSProperties => {
  if (isPlainObject(backdrop)) return backdrop;
  if (isString(backdrop)) return { backgroundColor: backdrop };
  return defaultBackdrop;
};
