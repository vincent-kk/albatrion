import { type PropsWithChildren, useMemo } from 'react';

import { useSnapshot } from '@winglet/react-utils/hook';

import type { FormProps } from '@/schema-form/components/Form';
import type { AttachedFilesMap } from '@/schema-form/types';

import { useExternalFormContext } from '../ExternalFormContext';
import { WorkspaceContext } from './WorkspaceContext';

interface UserDefinedContextProviderProps {
  /** File map, used to attach files for each input */
  attachedFilesMap: AttachedFilesMap;
  /** User-defined context, merged with global user-defined context */
  context: FormProps['context'];
}

export const WorkspaceContextProvider = ({
  attachedFilesMap,
  context: inputContext,
  children,
}: PropsWithChildren<UserDefinedContextProviderProps>) => {
  const external = useExternalFormContext();
  const context = useSnapshot(inputContext);
  const contextValue = useMemo(
    () => ({
      attachedFilesMap,
      context: {
        ...(external.context || {}),
        ...(context || {}),
      },
    }),
    [attachedFilesMap, external.context, context],
  );
  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};
