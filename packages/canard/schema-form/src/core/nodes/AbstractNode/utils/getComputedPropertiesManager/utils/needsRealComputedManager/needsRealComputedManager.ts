import { isArray } from '@winglet/common-utils/filter';

import type {
  JsonSchemaType,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

import {
  ALIAS,
  COMPUTED_FIELD_NAMES,
  STATE_FIELD_NAMES,
} from '../../ComputedPropertiesManager/utils/type';

/**
 * Decides whether a node must construct a real `ComputedPropertiesManager`
 * or may share the frozen `sharedComputedSentinel`.
 *
 * Returns `true` (real manager required) when ANY computed surface is present.
 * Deliberately CONSERVATIVE — keyed on PRESENCE (`!== undefined`), not
 * truthiness, because `computed.disabled: false` / `computed.if: false` still
 * compile to defined functions that `recalculate()` would apply. Any doubt
 * falls through to the real manager. Mirrors the exact read paths in
 * `checkComputedOptionFactory` / `getConditionIndexFactory` /
 * `getObservedValuesFactory` / `getDerivedValueFactory` so the sentinel is only
 * ever used when those factories would have produced no work.
 */
export const needsRealComputedManager = (
  type: JsonSchemaType,
  jsonSchema: JsonSchemaWithVirtual,
  rootSchema: JsonSchemaWithVirtual,
): boolean => {
  /** 1. any `computed.*` key present (boolean OR string both matter) */
  const computed = jsonSchema.computed;
  if (computed != null)
    for (const field of COMPUTED_FIELD_NAMES)
      if (computed[field] !== undefined) return true;

  for (const field of STATE_FIELD_NAMES) {
    /** 3. plain top-level state key on this node's schema */
    if (jsonSchema[field] !== undefined) return true;
    /** 4. root-schema inheritance (read FIRST for every node) */
    if (rootSchema[field] !== undefined) return true;
  }

  /** 2. any `&`-aliased key on this node's schema */
  for (const field of COMPUTED_FIELD_NAMES)
    if (jsonSchema[ALIAS + field] !== undefined) return true;

  /**
   * 5. object-typed conditional branches: conditions are synthesized from
   * member `const`/`enum` even without an explicit `&if`/`computed.if`.
   */
  if (
    type === 'object' &&
    (isArray(jsonSchema.oneOf) || isArray(jsonSchema.anyOf))
  )
    return true;

  return false;
};
