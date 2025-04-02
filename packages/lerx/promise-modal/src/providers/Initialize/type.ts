import type { Dictionary, Fn } from '@aileron/types';

import { ConfigurationContextProviderProps } from '../ConfigurationContext';

export interface InitializeProps extends ConfigurationContextProviderProps {
  usePathname?: Fn<[], { pathname: string }>;
  context?: Dictionary;
  root?: HTMLElement | null;
}

export interface InitializeHandle {
  bootstrap: Fn<[HTMLElement]>;
}
