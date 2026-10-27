import { fieldNodeFactory } from '../../../../surface';
import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';
import { blueprint } from '../../../blueprint';
import type { BlueprintSchema } from '../../../blueprint';
import { createSlotShadowSession } from '../../utils/verify/createSlotShadowSession';

/**
 * Build independently mutable on/off roots without changing a global mode.
 * @param schema - Authored shape shared by the independent source stores
 * @returns Both roots and the persistent public-reference comparison session
 */
export const createSlotVerifyPair = (
  schema: BlueprintSchema,
  slots: 'on' | 'verify' = 'on',
) => {
  const created: unknown = fieldNodeFactory(blueprint(schema), {
    slots,
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined,
  });
  const root = created as DispatchTestNode;
  const session = createSlotShadowSession(root);
  return { root, shadow: session.shadow, session };
};
