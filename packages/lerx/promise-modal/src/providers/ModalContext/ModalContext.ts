import {
  type ComponentType,
  type PropsWithChildren,
  createContext,
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
} from '@/promise-modal/types';

export interface ModalContextProps {
  ForegroundComponent: ComponentType<PropsWithChildren<ModalFrameProps>>;
  BackgroundComponent?: ComponentType<ModalFrameProps>;
  TitleComponent: ComponentType<PropsWithChildren>;
  SubtitleComponent: ComponentType<PropsWithChildren>;
  ContentComponent: ComponentType<PropsWithChildren>;
  FooterComponent: ComponentType<FooterComponentProps>;
  options: {
    duration: Duration;
    backdrop: Color;
    manualDestroy: boolean;
    closeOnBackdropClick: boolean;
  };
}

export const ModalContext = createContext<ModalContextProps>({
  ForegroundComponent: FallbackForegroundFrame,
  TitleComponent: FallbackTitle,
  SubtitleComponent: FallbackSubtitle,
  ContentComponent: FallbackContent,
  FooterComponent: FallbackFooter,
  options: {
    duration: DEFAULT_ANIMATION_DURATION,
    backdrop: DEFAULT_BACKDROP_COLOR,
    manualDestroy: false,
    closeOnBackdropClick: true,
  },
});
