import { createContext } from 'react';

import type { Dictionary } from '@aileron/declare';

export interface UserDefinedContext {
  context: Dictionary;
}

export const UserDefinedContext = createContext<UserDefinedContext>(
  {} as UserDefinedContext,
);
