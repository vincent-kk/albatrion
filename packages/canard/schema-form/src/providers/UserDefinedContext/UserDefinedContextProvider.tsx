import { type PropsWithChildren, useMemo } from 'react';

import { useSnapshot } from '@winglet/react-utils';

import type { FormProps } from '@/schema-form/components/Form';

import { useExternalFormContext } from '../ExternalFormContext';
import { UserDefinedContext } from './UserDefinedContext';

interface UserDefinedContextProviderProps {
  /** User-defined context, merged with global user-defined context */
  context: FormProps['context'];
}

export const UserDefinedContextProvider = ({
  context: inputContext,
  children,
}: PropsWithChildren<UserDefinedContextProviderProps>) => {
  const external = useExternalFormContext();
  const context = useSnapshot(inputContext);
  const contextValue = useMemo(
    () => ({
      context: {
        ...(external.context || {}),
        ...(context || {}),
      },
    }),
    [context, external.context],
  );
  return (
    <UserDefinedContext.Provider value={contextValue}>
      {children}
    </UserDefinedContext.Provider>
  );
};
