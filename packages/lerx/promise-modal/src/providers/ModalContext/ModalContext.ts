import { type ComponentType, createContext } from 'react';

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
  BackgroundComponent,
  FooterComponentProps,
  ForegroundComponent,
  WrapperComponentProps,
} from '@/promise-modal/types';

export interface ModalContextProps {
  ForegroundComponent: ForegroundComponent;
  BackgroundComponent?: BackgroundComponent;
  TitleComponent: ComponentType<WrapperComponentProps>;
  SubtitleComponent: ComponentType<WrapperComponentProps>;
  ContentComponent: ComponentType<WrapperComponentProps>;
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
