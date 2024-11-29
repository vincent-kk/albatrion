import { PropsWithChildren, useMemo } from 'react';

import type { FormProps } from '@lumy/schema-form/components/Form';

import { UserDefinedContext } from './UserDefinedContext';

interface UserDefinedContextProviderProps {
  /** 사용자 정의 컨텍스트 */
  context?: FormProps['context'];
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
