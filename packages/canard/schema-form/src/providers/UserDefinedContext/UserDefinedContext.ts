import { createContext } from 'react';

import { EMPTY_OBJECT } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/types';

export interface UserDefinedContext {
  /** 사용자 정의 컨텍스트 */
  context: Dictionary;
}

export const UserDefinedContext = createContext<UserDefinedContext>({
  context: EMPTY_OBJECT,
});
