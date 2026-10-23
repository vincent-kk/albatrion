import type { EffectiveSchema } from '../../types/effectiveSchema';
import type { BlueprintNode } from '../../types/node';

/** Weak default-runtime memo, also seeded by proven unconditional static normalization. */
export const DEFAULT_NO_ACTIVE = new WeakMap<BlueprintNode, EffectiveSchema>();
