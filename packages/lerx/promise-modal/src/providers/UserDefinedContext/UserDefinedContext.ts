import { createContext } from 'react';

import { EMPTY_OBJECT } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/types';

export interface UserDefinedContext {
  context: Dictionary;
}

export const UserDefinedContext = createContext<UserDefinedContext>({
  context: EMPTY_OBJECT,
});
