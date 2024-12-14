import { createContext } from 'react';

import {
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_BACKDROP_COLOR,
} from '@/promise-modal/app/constant';

import type { ModalProviderProps } from './type';

export const ModalContext = createContext<
  PickPartial<
    ModalProviderProps,
    | 'ForegroundComponent'
    | 'BackgroundComponent'
    | 'TitleComponent'
    | 'SubtitleComponent'
    | 'ContentComponent'
    | 'FooterComponent'
    | 'options'
  > &
    DeepRequired<Pick<ModalProviderProps, 'options'>>
>({
  options: {
    duration: DEFAULT_ANIMATION_DURATION,
    backdrop: DEFAULT_BACKDROP_COLOR,
  },
});
