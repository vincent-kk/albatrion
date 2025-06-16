import type { Fn } from '@aileron/declare';

import { StyleManager } from './StyleManager';

export const styleManagerFactory =
  (scopeId: string): Fn<[styleId: string, cssString: string], Fn> =>
  (styleId: string, cssString: string) => {
    StyleManager.get(scopeId).add(styleId, cssString);
    return () => StyleManager.get(scopeId).remove(styleId);
  };
