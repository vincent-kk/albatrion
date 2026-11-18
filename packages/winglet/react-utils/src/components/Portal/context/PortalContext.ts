import { createContext } from 'react';

import type { Fn } from '@aileron/declare';

/** Anchor state shared by one Portal.with scope. */
type PortalContextType = {
  /** Current destination; null until its callback ref attaches. */
  anchor: HTMLDivElement | null;
  /** Stable callback ref that follows anchor attachment, removal, and replacement. */
  setPortalAnchor: Fn<[element: HTMLDivElement | null]>;
};

/** Internal context supplied by Portal.with and consumed by Portal and its anchor. */
export const PortalContext = createContext<PortalContextType | null>(null);
