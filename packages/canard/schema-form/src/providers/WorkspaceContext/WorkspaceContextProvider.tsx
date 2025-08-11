import { type PropsWithChildren, useMemo } from 'react';

import { useSnapshot } from '@winglet/react-utils/hook';

import type { FormProps } from '@/schema-form/components/Form';
import type { FileMap } from '@/schema-form/types';

import { useExternalFormContext } from '../ExternalFormContext';
import { WorkspaceContext } from './WorkspaceContext';

interface UserDefinedContextProviderProps {
  /** User-defined context, merged with global user-defined context */
  context: FormProps['context'];
  /** File map, used to store files for each input */
  fileMap: FileMap;
}

export const WorkspaceContextProvider = ({
  context: inputContext,
  fileMap,
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
      fileMap,
    }),
    [external.context, context, fileMap],
  );
  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};
