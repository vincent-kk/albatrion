import { type ReactNode, createContext } from 'react';

import type { Fn } from '@aileron/declare';

type PortalContextType = {
  /**
   * Callback ref for the anchor element. It is a state setter rather than a ref
   * object so that attaching or replacing the anchor re-renders the provider —
   * a ref read during render cannot observe either.
   */
  setPortalAnchor: Fn<[element: HTMLDivElement | null]>;
  /** Registers or replaces the content of the portal owning `id`, keeping its render position. */
  register: Fn<[id: string, element: ReactNode]>;
  /** Removes the portal owning `id` from the anchor. */
  unregister: Fn<[id: string]>;
};

export const PortalContext = createContext<PortalContextType | null>(null);
