import type { Blueprint, EffectiveSchema } from '../../blueprint';
import type { FieldNodeRecord } from '../../record';

/** One sparse baseline schema restored at the ordinary priming boundary. */
interface FixedFirstBaselineEntry<Self extends FieldNodeRecord<Self>> {
  /** Existing unconditional occurrence; never replaced by this route. */
  readonly child: Self;
  /** Ungated schema reference from the original baseline construction. */
  readonly schema: EffectiveSchema;
}

/** Load-owned occurrence witnesses; no live reference is retained by the blueprint. */
export interface FixedFirstLoadPreparation<Self extends FieldNodeRecord<Self>> {
  /** Immutable compiler admission, read only during this load. */
  readonly plan: NonNullable<Blueprint['fixedFirstLoadPlan']>;
  /** Only primed hosts own sparse baseline schema witnesses. */
  readonly hosts: Map<Self, readonly FixedFirstBaselineEntry<Self>[]>;
}
