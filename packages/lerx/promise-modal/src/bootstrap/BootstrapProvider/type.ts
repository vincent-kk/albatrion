import type { Dictionary, Fn } from '@aileron/types';

import type { ConfigurationContextProviderProps } from '@/promise-modal/providers/ConfigurationContext';

export type BootstrapProviderProps = {
  usePathname?: Fn<[], { pathname: string }>;
  context?: Dictionary;
  root?: HTMLElement | null;
} & ConfigurationContextProviderProps;

export interface BootstrapProviderHandle {
  bootstrap: Fn<[HTMLElement]>;
}
