import type { SchemaTypeName } from '../../types/schemaType';
import type { StaticChoices } from '../../types/staticChoices';
import type { UnionSpec } from '../../types/unionSpec';

/** Producer-owned schema containers, consumed when shallow freezing finishes. */
export const ownedSchemaValues = new WeakSet<object>();
/** Static projection choices keyed by the produced effective-schema value. */
export const staticChoices = new WeakMap<object, StaticChoices>();
/** Most recent trimmed prefix for one immutable array value. */
export const trimmedArrays = new WeakMap<
  readonly unknown[],
  { end: number; result: readonly unknown[] }
>();
/** Defined-key counts of engine-assembled object values. */
export const objectKeyCounts = new WeakMap<object, number>();
/** Finite scalar restrictions, separated by nullable. */
export const scalarSpecs = [
  new Map<string, UnionSpec>(),
  new Map<string, UnionSpec>(),
];
/** Union restrictions keyed by immutable authored type-array values. */
export const unionSpecs = [
  new WeakMap<readonly SchemaTypeName[], UnionSpec>(),
  new WeakMap<readonly SchemaTypeName[], UnionSpec>(),
];
