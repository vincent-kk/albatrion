import { createContext } from 'react';

import { getModalManagerState } from '@/promise-modal/app';
import type { ModalManagerContextProps } from '@/promise-modal/types/context';

/** Context identity follows the existing version-compatible runtime registry. */
const state = getModalManagerState();
/** Lazily initialized so a compatible older registry can adopt the identity. */
export const ModalManagerContext = ((state.contexts ??= {}).manager ??=
  createContext<ModalManagerContextProps | undefined>(undefined));
