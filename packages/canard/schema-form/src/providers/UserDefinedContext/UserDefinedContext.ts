import { createContext } from 'react';

import type { Dictionary } from '@aileron/types';

export interface UserDefinedContext {
  context: Dictionary;
}

export const UserDefinedContext = createContext<UserDefinedContext>(
  {} as UserDefinedContext,
);
