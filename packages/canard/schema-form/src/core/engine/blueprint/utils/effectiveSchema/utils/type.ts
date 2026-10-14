import type { SchemaTypeName } from '../../../type';

/** Owned accumulation fields; opaque authored keywords retain their original values. */
export interface EffectiveSchemaFields extends Record<string, unknown> {
  /** Arrays registered only after their owner creates them. */
  required?: readonly unknown[];
  allOf?: readonly unknown[];
  enum?: readonly unknown[];
  /** Controls envelope created by the hint accumulator. */
  controls?: Record<string, unknown>;
}

/** Private accumulation state; authored schema objects are never mutation targets. */
export interface EffectiveSchemaState {
  /** Fresh result receiving only renderer hints and standard constraints. */
  readonly schema: EffectiveSchemaFields;
  /** Distinct patterns in authored order, finalized into pattern plus allOf. */
  readonly patterns: string[];
  /** Accepted type intersection, including null; absent for virtual nodes. */
  allowedTypes: readonly SchemaTypeName[] | undefined;
  /** A conflicting const stays impossible even when later constants are added. */
  conflictingConst: boolean;
  /** Empty type intersections belong to settlement and surface as `typeConflict`. */
  conflictingType: boolean;
}
