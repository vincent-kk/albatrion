import { PropsWithChildren, useMemo } from 'react';

import { EMPTY_OBJECT } from '@winglet/common-utils';

import type { FormProps } from '@/schema-form/components/Form';

import { UserDefinedContext } from './UserDefinedContext';

interface UserDefinedContextProviderProps {
  /** 사용자 정의 컨텍스트 */
  context: FormProps['context'];
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
