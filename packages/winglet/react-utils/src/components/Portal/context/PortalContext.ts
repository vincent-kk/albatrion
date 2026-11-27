import { type Dispatch, type SetStateAction, createContext } from 'react';

/** Anchor state shared by one Portal.with scope. */
type PortalContextType = {
  /** Current destination; null until its callback ref attaches. */
  anchor: HTMLDivElement | null;
  /** Stable state setter used for attachment and deletion of the current destination. */
  setPortalAnchor: Dispatch<SetStateAction<HTMLDivElement | null>>;
};

/** Internal context supplied by Portal.with and consumed by Portal and its anchor. */
export const PortalContext = createContext<PortalContextType | null>(null);
