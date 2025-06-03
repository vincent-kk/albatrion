import { createContext } from 'react';

import type { Dictionary } from '@aileron/declare';

export interface UserDefinedContext {
  /** User-defined context, merged with global user-defined context */
  context: Dictionary;
}

export const UserDefinedContext = createContext<UserDefinedContext>(
  {} as UserDefinedContext,
);
