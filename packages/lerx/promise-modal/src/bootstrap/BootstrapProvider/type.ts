import type { Dictionary, Fn } from '@aileron/declare';

import type { ConfigurationContextProviderProps } from '@/promise-modal/providers/ConfigurationContext';

export type BootstrapProviderProps = {
  usePathname?: Fn<[], { pathname: string }>;
  context?: Dictionary;
  /** Last declared portal root: undefined uses body; null defers or detaches. */
  root?: HTMLElement | null;
} & ConfigurationContextProviderProps;

export interface BootstrapProviderHandle {
  /** Selects the effective root without recreating the portal anchor. */
  initialize: Fn<[HTMLElement]>;
}
