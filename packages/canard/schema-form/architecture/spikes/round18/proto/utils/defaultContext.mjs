import { createContext } from './createContext.mjs';

/** Compatibility runtime owned by this module instance; separate probes run in separate processes. */
export const defaultContext = createContext();
