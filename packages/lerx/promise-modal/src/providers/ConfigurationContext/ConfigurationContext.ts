import { type ComponentType, createContext } from 'react';

import type {
  BackgroundComponent,
  FooterComponentProps,
  ForegroundComponent,
  ModalOptions,
  WrapperComponentProps,
} from '@/promise-modal/types';

export interface ConfigurationContextProps {
  ForegroundComponent: ForegroundComponent;
  BackgroundComponent?: BackgroundComponent;
  TitleComponent: ComponentType<WrapperComponentProps>;
  SubtitleComponent: ComponentType<WrapperComponentProps>;
  ContentComponent: ComponentType<WrapperComponentProps>;
  FooterComponent: ComponentType<FooterComponentProps>;
  options: Required<ModalOptions>;
}

export const ConfigurationContext = createContext<ConfigurationContextProps>(
  {} as ConfigurationContextProps,
);
