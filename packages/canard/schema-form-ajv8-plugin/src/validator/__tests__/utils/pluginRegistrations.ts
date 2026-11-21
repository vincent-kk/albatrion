import { PLUGIN_KEY_PREFIX } from '../../utils/makeSibling';

/**
 * List the instances that received an `addSchema` call under this plugin's registration keys.
 * @param spy - A Vitest spy on `addSchema`; its `calls` hold `[schema, key]` and its `contexts` the receiving instances
 * @returns One receiving instance per plugin-key registration, in call order
 */
export const pluginRegistrations = (spy: {
  mock: { calls: unknown[][]; contexts: unknown[] };
}): unknown[] =>
  spy.mock.calls.flatMap(([, key], index) =>
    typeof key === 'string' && key.startsWith(PLUGIN_KEY_PREFIX)
      ? [spy.mock.contexts[index]]
      : [],
  );
