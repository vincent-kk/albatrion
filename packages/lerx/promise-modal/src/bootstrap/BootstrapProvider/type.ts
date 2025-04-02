import type { Dictionary, Fn } from '@aileron/types';

import type { ConfigurationContextProviderProps } from '@/promise-modal/providers/ConfigurationContext';

export interface BootstrapProviderProps
  extends ConfigurationContextProviderProps {
  usePathname?: Fn<[], { pathname: string }>;
  context?: Dictionary;
  root?: HTMLElement | null;
}

export interface BootstrapProviderHandle {
  bootstrap: Fn<[HTMLElement]>;
}
