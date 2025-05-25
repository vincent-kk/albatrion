import { PropsWithChildren, useMemo } from 'react';

import type { FormProps } from '@/schema-form/components/Form';

import { UserDefinedContext } from './UserDefinedContext';

interface UserDefinedContextProviderProps {
  /** User-defined context */
  context: FormProps['context'];
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
