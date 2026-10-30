import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../../blueprint';
import { dispatchMount } from '../../../write';

/**
 * Mount a fresh dispatcher tree from the same authored source and context.
 * @param schema - Authored gates and state keys under test
 * @param value - Final caller source, including latent raw values
 * @param context - Binding context supplied before the first load
 * @returns Mounted record for publication equality assertions
 */
export const mountPresenceTree = (
  schema: BlueprintSchema,
  value?: unknown,
  context: Readonly<Record<string, unknown>> = {},
) => {
  const { root } = createDispatchTree(schema);
  root.runtime.context = context;
  dispatchMount(root, value);
  return root;
};
