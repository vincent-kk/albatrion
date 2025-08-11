import { createContext } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { FileMap } from '@/schema-form/types';

export interface WorkspaceContext {
  /** User-defined context, merged with global user-defined context */
  context: Dictionary;
  /** File map, used to store files for each input */
  fileMap: FileMap;
}

export const WorkspaceContext = createContext<WorkspaceContext>(
  {} as WorkspaceContext,
);
