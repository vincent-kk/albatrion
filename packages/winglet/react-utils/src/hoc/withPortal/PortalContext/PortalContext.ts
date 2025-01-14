import { type ReactNode, type RefObject, createContext } from 'react';

type PortalContextType = {
  portalAnchorRef: RefObject<HTMLDivElement>;
  register: (element: ReactNode) => string;
  unregister: (id: string) => void;
};

export const PortalContext = createContext<PortalContextType | null>(null);
