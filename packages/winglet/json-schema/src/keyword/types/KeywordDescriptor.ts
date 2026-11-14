import type { Dialect } from '../constants/Dialect';

/**
 * How a keyword's value maps to child subschemas during traversal.
 *
 * - `schema`     — single subschema (`not`, `if`, `additionalProperties`, …).
 * - `schemaList` — array of subschemas (`allOf`, …); `variant` is the index.
 * - `schemaMap`  — record of subschemas keyed by name (`$defs`, `patternProperties`, …).
 * - `objectMap`  — like `schemaMap` but the key contributes an (escaped) `dataPath` segment (`properties`).
 * - `items`      — tuple (array, each child adds its index to `dataPath`) or single subschema (`items`, `prefixItems`).
 */
export type KeywordKind =
  | 'schema'
  | 'schemaList'
  | 'schemaMap'
  | 'objectMap'
  | 'items';

/** A single entry in the traversal vocabulary: which keyword to descend into and how. */
export interface KeywordDescriptor {
  keyword: string;
  kind: KeywordKind;
  /** Accepted schema-position dialects; omission accepts every supported dialect. */
  dialects?: readonly Dialect[];
}
