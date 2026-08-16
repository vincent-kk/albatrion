import { type ReactNode, createContext } from 'react';

type PortalContextType = {
  /**
   * Callback ref for the anchor element. It is a state setter rather than a ref
   * object so that attaching or replacing the anchor re-renders the provider —
   * a ref read during render cannot observe either.
   */
  setPortalAnchor: (element: HTMLDivElement | null) => void;
  /** Registers or replaces the content of the portal owning `id`, keeping its render position. */
  register: (id: string, element: ReactNode) => void;
  /** Removes the portal owning `id` from the anchor. */
  unregister: (id: string) => void;
};

export const PortalContext = createContext<PortalContextType | null>(null);
