import { createContext } from 'react';

import type { Dictionary } from '@aileron/declare';

import { getModalManagerState } from '@/promise-modal/app';

/** Context identity follows the existing version-compatible runtime registry. */
const state = getModalManagerState();
/** Lazily initialized so a compatible older registry can adopt the identity. */
export const UserDefinedContext = ((state.contexts ??= {}).userDefined ??= createContext<{ context: Dictionary }>({ context: {} }));
