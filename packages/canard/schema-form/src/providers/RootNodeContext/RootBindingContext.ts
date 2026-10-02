import { type MutableRefObject, createContext } from 'react';

import type { RootBinding } from './type';

/** Synchronous root identity shared with callbacks that outlive their rendered field. */
export const RootBindingContext =
  createContext<MutableRefObject<RootBinding> | null>(null);
