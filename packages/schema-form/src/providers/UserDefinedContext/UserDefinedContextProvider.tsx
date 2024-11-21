import { PropsWithChildren, useMemo } from 'react';

import { UserDefinedContext } from './UserDefinedContext';

export interface UserDefinedContextProviderProps {
  context?: Dictionary;
}

export const UserDefinedContextProvider = ({
  context = {},
  children,
}: PropsWithChildren<UserDefinedContextProviderProps>) => {
  const contextValue = useMemo(() => ({ context }), [context]);
  return (
    <UserDefinedContext.Provider value={contextValue}>
      {children}
    </UserDefinedContext.Provider>
  );
};
