/** Vitest installs its Browser Mode marker on the browser's global scope. */
declare global {
  /** Runtime marker consumed by Storybook's Vitest addon to identify Browser Mode. */
  var __vitest_browser__: unknown;
}

/**
 * Read the runtime marker owned by Vitest rather than infer the mode from a URL.
 * @returns Whether the current play is running in Vitest Browser Mode.
 */
export function isVitestBrowserMode(): boolean {
  return Boolean(globalThis.__vitest_browser__);
}
