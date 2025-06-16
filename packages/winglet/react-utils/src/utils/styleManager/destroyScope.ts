import { StyleManager } from './StyleManager';

export const destroyScope = (scopeId: string): void =>
  StyleManager.get(scopeId).destroy();
