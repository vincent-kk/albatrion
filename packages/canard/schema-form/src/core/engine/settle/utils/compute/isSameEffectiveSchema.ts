import { equals } from '@winglet/common-utils/object';

import type { EffectiveSchema } from '../../../blueprint';

/**
 * Whether two effective-schema records carry the same schema.
 * Separate memos (an admitted edge's, the id-keyed merge, the ungated baseline, and the fresh
 * derived stores an engine-mode switch creates) hand out equal records under different
 * identities; for a retained child only a difference in content is a schema change.
 * @param current - Schema the child holds from its last actual selection
 * @param next - Schema this wheel composed or started the child from
 * @returns Whether the two records carry the same schema; the deep comparison runs only when identities differ
 */
export const isSameEffectiveSchema = (
  current: EffectiveSchema,
  next: EffectiveSchema,
): boolean =>
  current === next ||
  (current.hasTypeConflict === next.hasTypeConflict &&
    equals(current.schema, next.schema));
