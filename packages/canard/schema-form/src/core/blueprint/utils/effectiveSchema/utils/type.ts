import type { SchemaTypeName } from '../../../type';

/** Private accumulation state; authored schema objects are never mutation targets. */
export interface EffectiveSchemaState {
  /** Fresh result receiving only renderer hints and standard constraints. */
  readonly schema: Record<string, unknown>;
  /** Distinct patterns in authored order, finalized into pattern plus allOf. */
  readonly patterns: string[];
  /** Accepted type intersection, including null; absent for virtual nodes. */
  allowedTypes: readonly SchemaTypeName[] | undefined;
  /** A conflicting const stays impossible even when later constants are added. */
  conflictingConst: boolean;
  /** Empty type intersections belong to settlement; enum empty is only a hint. */
  conflictingType: boolean;
}
