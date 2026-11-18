import { type PropsWithChildren, useId, useMemo } from 'react';

import type { FormProps } from '@/schema-form/components/Form';

import { useExternalFormContext } from '../../ExternalFormContext';
import { useContextSnapshot } from '../../hooks/contextSnapshot/useContextSnapshot';
import type { AttachedFilesStore } from '../utils/AttachedFilesStore';
import { WorkspaceContext } from './WorkspaceContext';

interface UserDefinedContextProviderProps {
  /** File map, used to attach files for each input */
  attachedFilesMap: AttachedFilesStore;
  /** User-defined context, merged with global user-defined context */
  context: FormProps['context'];
}

export const WorkspaceContextProvider = ({
  attachedFilesMap,
  context: inputContext,
  children,
}: PropsWithChildren<UserDefinedContextProviderProps>) => {
  const external = useExternalFormContext();
  const formId = useId();
  const context = useContextSnapshot(inputContext);
  const contextValue = useMemo(
    () => ({
      attachedFilesMap,
      formId,
      context: {
        ...(external.context || {}),
        ...(context || {}),
      },
    }),
    [attachedFilesMap, external.context, context, formId],
  );
  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};
