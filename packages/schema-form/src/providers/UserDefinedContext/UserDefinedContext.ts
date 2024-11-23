import { createContext } from 'react';

export interface UserDefinedContext {
  context: Dictionary;
}

export const UserDefinedContext = createContext<UserDefinedContext>(
  {} as UserDefinedContext,
);
