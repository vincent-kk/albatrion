import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../../blueprint';
import { ValidationMode } from '../../../types/state';
import { WriteOption } from '../../../types/value';
import { dispatchMount } from '../../../write';

/**
 * Mount actual node records with validation disabled for exit-read checks.
 * @param schema - Authored shape, including virtual and watch declarations
 * @param snapshot - Initial load source
 * @returns The mounted root retaining its load snapshot
 */
export const createDetachedCaptureTree = (
  schema: BlueprintSchema,
  snapshot: unknown,
) => {
  const { root } = createDispatchTree(schema, snapshot);
  root.runtime.validationMode = ValidationMode.None;
  dispatchMount(root, snapshot, WriteOption.Overwrite, {
    deferValidation: true,
  });
  return root;
};
