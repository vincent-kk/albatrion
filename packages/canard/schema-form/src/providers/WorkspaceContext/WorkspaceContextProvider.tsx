import { type PropsWithChildren, useMemo } from 'react';

import { useSnapshot } from '@winglet/react-utils/hook';

import type { FormProps } from '@/schema-form/components/Form';
import type { AttachedFileMap } from '@/schema-form/types';

import { useExternalFormContext } from '../ExternalFormContext';
import { WorkspaceContext } from './WorkspaceContext';

interface UserDefinedContextProviderProps {
  /** File map, used to attach files for each input */
  attachedFileMap: AttachedFileMap;
  /** User-defined context, merged with global user-defined context */
  context: FormProps['context'];
}

export const WorkspaceContextProvider = ({
  attachedFileMap,
  context: inputContext,
  children,
}: PropsWithChildren<UserDefinedContextProviderProps>) => {
  const external = useExternalFormContext();
  const context = useSnapshot(inputContext);
  const contextValue = useMemo(
    () => ({
      attachedFileMap,
      context: {
        ...(external.context || {}),
        ...(context || {}),
      },
    }),
    [attachedFileMap, external.context, context],
  );
  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};
