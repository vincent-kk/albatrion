import { createContext } from 'react';

import type { Dictionary } from '@aileron/declare';

export interface UserDefinedContextProps {
  context: Dictionary;
}

export const UserDefinedContext = createContext<UserDefinedContextProps>(
  {} as UserDefinedContextProps,
);
