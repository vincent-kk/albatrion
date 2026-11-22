import { createContext } from 'react';

import { getModalManagerState } from '@/promise-modal/app';
import type { ConfigurationContextProps } from '@/promise-modal/types/context';

/** Context identity follows the existing version-compatible runtime registry. */
const state = getModalManagerState();
/** Lazily initialized so a compatible older registry can adopt the identity. */
export const ConfigurationContext = ((state.contexts ??= {}).configuration ??=
  createContext<ConfigurationContextProps | undefined>(undefined));
