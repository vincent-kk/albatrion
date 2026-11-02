import {
  buildArraySchema,
  buildFlatSchema,
  buildNestedSchema,
} from '../../src/fixtures/scale-schemas';
import type { CoreFixture } from './types';

/**
 * Resolve core case grammar through operation/shape rules and canonical generators.
 * @param id - A mount, nonburst typing, first-key or rebuild core case identifier.
 * @returns A fresh schema with its native control count and public target path.
 * @throws If the identifier or its operation/shape/validation combination is unsupported.
 */
export function getCoreFixture(id: string): CoreFixture {
  const parsed =
    /^(mount|type|first-key|rebuild)-(if-flat-500|flat-500|nested-d5-f4|array-1000)(?:-(none|validate)(?:-(nonburst))?)?$/.exec(
      id,
    );
  if (!parsed || parsed[0] !== id)
    throw new Error('Unknown core fixture: ' + id);
  const [, , shape, mode, interval] = parsed;
  const operation = id.startsWith('mount-')
    ? 'mount'
    : id.startsWith('type-')
      ? 'type'
      : id.startsWith('first-key-')
        ? 'first-key'
        : 'rebuild';
  const supported =
    operation === 'mount'
      ? mode !== undefined &&
        !interval &&
        (shape === 'flat-500' || shape === 'if-flat-500' || mode === 'validate')
      : operation === 'type'
        ? mode === 'validate' &&
          interval === 'nonburst' &&
          (shape === 'flat-500' || shape === 'array-1000')
        : operation === 'first-key'
          ? shape === 'flat-500' && mode === 'validate' && !interval
          : shape === 'flat-500' && !mode && !interval;
  if (!supported) throw new Error('Unknown core fixture: ' + id);
  const nested = shape === 'nested-d5-f4';
  const array = shape === 'array-1000';
  const conditional = shape === 'if-flat-500';
  let schema = nested
    ? buildNestedSchema(5, 4)
    : array
      ? buildArraySchema(1000)
      : buildFlatSchema(500);
  if (conditional) {
    const properties = Object.fromEntries(
      Object.values(schema.properties ?? {}).map((field, index) => {
        if (!field) throw new Error('Core generated flat property missing');
        return [`field_${index}`, { type: field.type }];
      }),
    );
    schema = {
      type: 'object',
      properties: { ...properties, kind: { type: 'string', default: 'a' } },
      if: { properties: { kind: { const: 'a' } } },
      then: { properties: { field_0: { minLength: 2 } } },
    };
  }
  if (operation === 'type' || operation === 'first-key') {
    const items = schema.properties?.items?.items;
    const leaf = array
      ? items && 'type' in items
        ? items.properties?.name
        : undefined
      : schema.properties?.field_000;
    if (!leaf) throw new Error('Core typing leaf missing: ' + id);
    leaf.pattern = '^(?:..)*$';
  }
  return {
    id,
    schema,
    target: nested
      ? '/n0/n0/n0/n0/n0'
      : array
        ? '/items/0/name'
        : conditional
          ? '/field_0'
          : '/field_000',
    expectedInputs: nested ? 1024 : array ? 3000 : conditional ? 501 : 500,
    operation,
    validation: mode !== 'none',
    defaultValidation: operation === 'mount' && mode === 'validate',
    intervalMs: operation === 'type' ? 100 : 0,
  };
}
