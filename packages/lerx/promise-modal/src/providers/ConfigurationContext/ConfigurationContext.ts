import { type CSSProperties, type ComponentType, createContext } from 'react';

import type {
  BackgroundComponent,
  FooterComponentProps,
  ForegroundComponent,
  WrapperComponentProps,
} from '@/promise-modal/types/base';
import type { ModalOptions } from '@/promise-modal/types/option';

export interface ConfigurationContextProps {
  ForegroundComponent: ForegroundComponent;
  BackgroundComponent?: BackgroundComponent;
  TitleComponent: ComponentType<WrapperComponentProps>;
  SubtitleComponent: ComponentType<WrapperComponentProps>;
  ContentComponent: ComponentType<WrapperComponentProps>;
  FooterComponent: ComponentType<FooterComponentProps>;
  options: Required<
    Omit<ModalOptions, 'backdrop' | 'duration' | 'closeOnEscape'> & {
      backdrop: CSSProperties;
      duration: `${number}ms`;
    }
  > &
    Pick<ModalOptions, 'closeOnEscape'>;
}

export const ConfigurationContext = createContext<
  ConfigurationContextProps | undefined
>(undefined);
