import { createContext } from 'react';

interface UserDefinedContext {
  context: Dictionary;
}

export const UserDefinedContext = createContext<UserDefinedContext>(
  {} as UserDefinedContext,
);
