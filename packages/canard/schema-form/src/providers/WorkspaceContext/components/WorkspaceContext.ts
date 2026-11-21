import { createContext } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { InputPositions } from '@/schema-form/helpers/focusTarget';

import type { AttachedFilesStore } from '../utils/AttachedFilesStore';

export interface WorkspaceContext {
  /** Stable per-Form scope for DOM ids, separate from JSON Pointer paths. */
  formId: string;
  /** File map, used to attach files for each input */
  attachedFilesMap: AttachedFilesStore;
  /** Actual input positions supplied by the owning form. */
  inputPositions: InputPositions;
  /** User-defined context, merged with global user-defined context */
  context: Dictionary;
}

export const WorkspaceContext = createContext<WorkspaceContext>(
  {} as WorkspaceContext,
);
