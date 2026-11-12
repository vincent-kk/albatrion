import { createContext } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { AttachedFilesStore } from '../utils/AttachedFilesStore';

export interface WorkspaceContext {
  /** File map, used to attach files for each input */
  attachedFilesMap: AttachedFilesStore;
  /** User-defined context, merged with global user-defined context */
  context: Dictionary;
}

export const WorkspaceContext = createContext<WorkspaceContext>(
  {} as WorkspaceContext,
);
