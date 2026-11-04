import { createContext } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { AttachedFilesMap } from '@/schema-form/types';

export interface WorkspaceContext {
  /** File map, used to attach files for each input */
  attachedFilesMap: AttachedFilesMap;
  /** User-defined context, merged with global user-defined context */
  context: Dictionary;
}

export const WorkspaceContext = createContext<WorkspaceContext>(
  {} as WorkspaceContext,
);
