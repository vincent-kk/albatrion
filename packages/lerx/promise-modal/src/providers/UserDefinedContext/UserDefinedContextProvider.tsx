import { PropsWithChildren, useMemo } from 'react';

import { EMPTY_OBJECT } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/types';

import { UserDefinedContext } from './UserDefinedContext';

interface UserDefinedContextProviderProps {
  /** 사용자 정의 컨텍스트 */
  context?: Dictionary;
}

export const UserDefinedContextProvider = ({
  context,
  children,
}: PropsWithChildren<UserDefinedContextProviderProps>) => {
  const contextValue = useMemo(
    () => ({ context: context || EMPTY_OBJECT }),
    [context],
  );
  return (
    <UserDefinedContext.Provider value={contextValue}>
      {children}
    </UserDefinedContext.Provider>
  );
};
