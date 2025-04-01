import { type ComponentType, createContext } from 'react';

import type { Color, Duration } from '@aileron/types';

import type {
  BackgroundComponent,
  FooterComponentProps,
  ForegroundComponent,
  WrapperComponentProps,
} from '@/promise-modal/types';

export interface ConfigurationContextProps {
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

export const ConfigurationContext = createContext<ConfigurationContextProps>(
  {} as ConfigurationContextProps,
);
