import { createContext } from 'react';

import type { ModalManagerContextProps } from '@/promise-modal/types/context';
import { getModalManagerState } from '@/promise-modal/app';

/** Context identity follows the existing version-compatible runtime registry. */
const state = getModalManagerState();
/** Lazily initialized so a compatible older registry can adopt the identity. */
export const ModalManagerContext = ((state.contexts ??= {}).manager ??= createContext<ModalManagerContextProps | undefined>(undefined));
