import { createContext } from 'react';

import type { ConfigurationContextProps } from '@/promise-modal/types/context';
import { getModalManagerState } from '@/promise-modal/app';

/** Context identity follows the existing version-compatible runtime registry. */
const state = getModalManagerState();
/** Lazily initialized so a compatible older registry can adopt the identity. */
export const ConfigurationContext = ((state.contexts ??= {}).configuration ??= createContext<ConfigurationContextProps | undefined>(undefined));
