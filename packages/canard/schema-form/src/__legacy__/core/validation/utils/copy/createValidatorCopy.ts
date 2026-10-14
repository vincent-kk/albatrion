import { isArray } from '@winglet/common-utils/filter';
import type { BlueprintSchema } from '../../../blueprint';

/** Schema-valued keyword slots traversed as schemas rather than annotation data. */
const SCHEMA_KEYS = new Set([
  'additionalProperties', 'unevaluatedProperties', 'propertyNames', 'contains',
  'items', 'not', 'if', 'then', 'else', 'additionalItems',
  'unevaluatedItems', 'contentSchema',
]);

/** Object maps whose values are authored subschemas. */
const SCHEMA_MAP_KEYS = new Set([
  'properties', 'patternProperties', '$defs', 'definitions', 'dependentSchemas',
  'dependencies',
]);

/** Ordered arrays whose entries are authored subschemas. */
const SCHEMA_ARRAY_KEYS = new Set(['allOf', 'anyOf', 'oneOf', 'prefixItems']);

/**
 * Deep-copy authored schema data while excluding form extensions at schema positions.
 * @param authored - Root schema whose nested annotation data must remain intact.
 * @returns An independent validator input without rewriting required fields.
 */
export const createValidatorCopy = (authored: BlueprintSchema): BlueprintSchema => {
  if (typeof authored !== 'object' || authored === null) return authored;
  const copy: Record<string, unknown> = {};
  const seen = new WeakMap<object, object>([[authored, copy]]);
  const pending: { source: object; target: object;
    kind: 'schema' | 'map' | 'array' | 'data' }[] = [
    { source: authored, target: copy, kind: 'schema' },
  ];
  while (pending.length) {
    const current = pending.pop();
    if (!current) continue;
    for (const [key, value] of Object.entries(current.source)) {
      if (current.kind === 'schema' &&
        (key === 'controls' || key === 'options' || key === 'presentation'))
        continue;
      const childKind = current.kind === 'schema'
        ? SCHEMA_KEYS.has(key) ? isArray(value) ? 'array' : 'schema'
          : SCHEMA_MAP_KEYS.has(key) ? 'map'
            : SCHEMA_ARRAY_KEYS.has(key) ? 'array' : 'data'
        : current.kind === 'map' || current.kind === 'array'
          ? 'schema' : 'data';
      if (value === null || typeof value !== 'object') {
        Object.defineProperty(current.target, key, { value, enumerable: true,
          configurable: true, writable: true });
        continue;
      }
      let child = seen.get(value);
      if (!child) {
        child = isArray(value) ? [] : {};
        seen.set(value, child);
        pending.push({ source: value, target: child, kind: childKind });
      }
      Object.defineProperty(current.target, key, { value: child, enumerable: true,
        configurable: true, writable: true });
    }
  }
  return copy;
};
