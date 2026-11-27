import { createPluginManager } from './createPluginManager';
import { getPluginRegistry } from './getPluginRegistry';

/** Default manager retains the realm-shared, version-compatible registry. */
export const PluginManager = createPluginManager(getPluginRegistry());
