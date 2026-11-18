import { createPluginManager } from './createPluginManager';
import { getPluginRegistry } from './getPluginRegistry';

/** Managers are module-local views over the realm's versioned scoped registries. */
const managers = new Map<string | symbol, ReturnType<typeof createPluginManager>>();

/**
 * Resolve the application-selected registry without repeating setup for its forms.
 * @param scope - Stable application token; strings and symbols have distinct identities.
 * @returns Cached manager that shares state with compatible copies using this scope.
 */
export const getScopedPluginManager = (scope: string | symbol) => {
  let manager = managers.get(scope);
  if (!manager) {
    manager = createPluginManager(getPluginRegistry(scope));
    managers.set(scope, manager);
  }
  return manager;
};
