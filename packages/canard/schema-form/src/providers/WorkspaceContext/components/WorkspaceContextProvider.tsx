import type { ReactElement } from 'react';
import { type PropsWithChildren, useId, useMemo } from 'react';

import type { FormProps } from '@/schema-form/components/Form';
import { formatSegment } from '@/schema-form/helpers/jsonPointer';

import { useContextSnapshot } from '../../hooks/contextSnapshot/useContextSnapshot';
import type { AttachedFilesStore } from '../utils/AttachedFilesStore';
import { WorkspaceContext } from './WorkspaceContext';

interface UserDefinedContextProviderProps {
  /** File map, used to attach files for each input */
  attachedFilesMap: AttachedFilesStore;
  /** Actual input positions supplied by the owning form. */
  inputPositions: WorkspaceContext['inputPositions'];
  /** Context defaults from the enclosing application provider. */
  externalContext: FormProps['context'];
  /** User-defined context, merged with global user-defined context */
  context: FormProps['context'];
}

export const WorkspaceContextProvider = ({
  attachedFilesMap,
  inputPositions,
  externalContext,
  context: inputContext,
  children,
}: PropsWithChildren<UserDefinedContextProviderProps>): ReactElement => {
  const formId = formatSegment(useId());
  const context = useContextSnapshot(inputContext);
  const contextValue = useMemo(
    () => ({
      attachedFilesMap,
      inputPositions,
      formId,
      context: {
        ...(externalContext || {}),
        ...(context || {}),
      },
    }),
    [attachedFilesMap, inputPositions, externalContext, context, formId],
  );
  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};
