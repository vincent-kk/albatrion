import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createSchemaRootRegistry } from '../createSchemaRootRegistry';
import { registerSchemaRoot } from '../registerSchemaRoot';

it('preserves serialized identifier and dynamic metadata for nested schema and literal objects', () => {
  const source = new Ajv({ meta: false, validateSchema: false, logger: false });
  const registry = createSchemaRootRegistry();
  const names = [
    '$id',
    'id',
    '$dynamicRef',
    '$dynamicAnchor',
    '$recursiveRef',
    '$recursiveAnchor',
    'prefix"$id',
    'prefix"$dynamicRef',
  ];
  for (let seed = 0; seed < 256; seed++) {
    const data: Record<string, unknown> = {};
    for (let index = 0; index < names.length; index++) {
      const values = [
        'id-' + seed,
        seed,
        null,
        { $id: 'nested-' + seed },
        [{ id: 'array-' + seed }],
        undefined,
      ];
      data[names[index]] = values[(seed + index) % values.length];
    }
    const root: JSONSchema = {
      type: 'object',
      default: data,
      properties: { item: { type: 'string', $id: 'item-' + seed } },
    };
    const serialized = JSON.stringify(root);
    const ids: string[] = [];
    let hasDynamicKeywords = false;
    JSON.parse(serialized, (name, value: unknown) => {
      if (name === '$id' && typeof value === 'string') ids.push(value);
      if (
        [
          '$dynamicRef',
          '$dynamicAnchor',
          '$recursiveRef',
          '$recursiveAnchor',
        ].includes(name)
      )
        hasDynamicKeywords = true;
      return value;
    });
    const registration = registerSchemaRoot(registry, source, root);
    expect([...registration.ids].sort(), 'identifiers seed=' + seed).toEqual(
      ids.sort(),
    );
    expect(registration.hasDynamicKeywords, 'dynamic seed=' + seed).toBe(
      hasDynamicKeywords,
    );
    expect(registration.copy, 'snapshot seed=' + seed).toEqual(
      JSON.parse(serialized),
    );
    expect(registration.copy).not.toBe(root);
    expect(registerSchemaRoot(registry, source, root)).toBe(registration);
  }
});
