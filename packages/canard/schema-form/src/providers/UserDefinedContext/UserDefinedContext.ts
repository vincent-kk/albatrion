import { createContext } from 'react';

import type { Dictionary } from '@aileron/types';

export interface UserDefinedContext {
  /** 사용자 정의 컨텍스트 */
  context: Dictionary;
}

export const UserDefinedContext = createContext<UserDefinedContext>(
  {} as UserDefinedContext,
);
