import { registerEngineDerivedReset } from '../../../utils/cache/engineModes';
import type { EffectiveSchema } from '../../types/effectiveSchema';
import type { BlueprintNode } from '../../types/node';

/** Weak default-runtime memo, also seeded by proven unconditional static normalization. */
export let DEFAULT_NO_ACTIVE = new WeakMap<BlueprintNode, EffectiveSchema>();
registerEngineDerivedReset(() => {
  DEFAULT_NO_ACTIVE = new WeakMap<BlueprintNode, EffectiveSchema>();
});
