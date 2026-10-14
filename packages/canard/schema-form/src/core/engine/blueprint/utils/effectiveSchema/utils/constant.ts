import type { BlueprintNode, EffectiveSchema } from '../../../type';

/** Weak default-runtime memo, also seeded by proven unconditional static normalization. */
export const DEFAULT_NO_ACTIVE = new WeakMap<BlueprintNode, EffectiveSchema>();
