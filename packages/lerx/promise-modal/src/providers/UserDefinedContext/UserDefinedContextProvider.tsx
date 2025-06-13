import { type PropsWithChildren, useMemo } from 'react';

import type { Dictionary } from '@aileron/declare';

import { UserDefinedContext } from './UserDefinedContext';

interface UserDefinedContextProviderProps {
  /** User defined context */
  context?: Dictionary;
}

export const UserDefinedContextProvider = ({
  context,
  children,
}: PropsWithChildren<UserDefinedContextProviderProps>) => {
  const contextValue = useMemo(() => ({ context: context || {} }), [context]);
  return (
    <UserDefinedContext.Provider value={contextValue}>
      {children}
    </UserDefinedContext.Provider>
  );
};
