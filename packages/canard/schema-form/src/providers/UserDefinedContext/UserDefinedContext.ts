import { createContext } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { FileMap } from '@/schema-form/types';

export interface UserDefinedContext {
  /** User-defined context, merged with global user-defined context */
  context: Dictionary;
  /** File map, used to store files for each input */
  fileMap: FileMap;
}

export const UserDefinedContext = createContext<UserDefinedContext>(
  {} as UserDefinedContext,
);
