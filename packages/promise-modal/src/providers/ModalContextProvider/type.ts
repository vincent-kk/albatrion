import type { ComponentType, PropsWithChildren } from 'react';

import type {
  FooterComponentProps,
  ModalFrameProps,
} from '@/promise-modal/types';

export interface ModalProviderProps {
  ForegroundComponent?: ComponentType<ModalFrameProps>;
  BackgroundComponent?: ComponentType<ModalFrameProps>;
  TitleComponent?: ComponentType<PropsWithChildren>;
  SubtitleComponent?: ComponentType<PropsWithChildren>;
  ContentComponent?: ComponentType<PropsWithChildren>;
  FooterComponent?: ComponentType<FooterComponentProps>;
  options?: {
    /** Modal transition time(ms, s) */
    duration?: `${number}ms` | `${number}s`;
    /** Modal backdrop color */
    backdrop?: Color;
  };
  usePathname?: () => { pathname: string };
}
