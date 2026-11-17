import { type RefObject, createContext } from 'react';

import type { Nullable } from '@aileron/declare';

import type { RootBinding } from '../type';

/** Synchronous root identity shared with callbacks that outlive their rendered field. */
export const RootBindingContext =
  createContext<Nullable<RefObject<RootBinding>>>(null);
