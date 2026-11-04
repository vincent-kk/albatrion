import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@canard/schema-form';

import {
  buildArraySchema,
  buildFlatSchema,
  buildNestedSchema,
} from '../../../src/fixtures/scale-schemas';
import cases from '../../core-cases.json';
import { CORE_PROBE } from '../coreProbe';
import { getCoreFixture } from '../getCoreFixture';

/** The probe leaf every validated shape gains. */
const probe = { type: 'string', pattern: '^(?:..)*$', default: 'x' };

/** Canonical schema with the probe leaf added beside the root properties. */
const probed = (schema: JSONSchema) => ({
  ...schema,
  properties: { ...schema.properties, probe },
});

/** Independent expected surface; changes to the case manifest must be deliberate. */
const rows = [
  {
    id: 'mount-flat-500-none',
    operation: 'mount',
    target: '/field_000',
    expectedInputs: 500,
    measuredPath: null,
    validation: false,
  },
  {
    id: 'mount-flat-500-validate',
    operation: 'mount',
    target: '/field_000',
    expectedInputs: 501,
    measuredPath: '/probe',
    validation: true,
  },
  {
    id: 'mount-if-flat-500-none',
    operation: 'mount',
    target: '/field_0',
    expectedInputs: 501,
    measuredPath: null,
    validation: false,
  },
  {
    id: 'mount-if-flat-500-validate',
    operation: 'mount',
    target: '/field_0',
    expectedInputs: 502,
    measuredPath: '/probe',
    validation: true,
  },
  {
    id: 'mount-nested-d5-f4-validate',
    operation: 'mount',
    target: '/n0/n0/n0/n0/n0',
    expectedInputs: 1025,
    measuredPath: '/probe',
    validation: true,
  },
  {
    id: 'mount-array-1000-validate',
    operation: 'mount',
    target: '/items/0/name',
    expectedInputs: 3001,
    measuredPath: '/probe',
    validation: true,
  },
  {
    id: 'type-flat-500-validate-nonburst',
    operation: 'type',
    target: '/field_000',
    expectedInputs: 501,
    measuredPath: '/field_000',
    validation: true,
  },
  {
    id: 'type-array-1000-validate-nonburst',
    operation: 'type',
    target: '/items/0/name',
    expectedInputs: 3001,
    measuredPath: '/items/0/name',
    validation: true,
  },
  {
    id: 'first-key-flat-500-validate',
    operation: 'first-key',
    target: '/field_000',
    expectedInputs: 501,
    measuredPath: '/field_000',
    validation: true,
  },
  {
    id: 'rebuild-flat-500',
    operation: 'rebuild',
    target: '/field_000',
    expectedInputs: 501,
    measuredPath: '/probe',
    validation: true,
  },
];

describe('core fixture contract', () => {
  it('keeps exactly the ten approved cases in their reporting order', () => {
    expect(cases).toEqual(rows.map((row) => row.id));
  });

  it.each(rows)('resolves $id with its public operation and target', (row) => {
    const fixture = getCoreFixture(row.id);
    expect(fixture).toMatchObject(row);
    expect(fixture.defaultValidation).toBe(
      row.operation === 'mount' && row.validation,
    );
    expect(fixture.intervalMs).toBe(row.operation === 'type' ? 100 : 0);
  });

  it('rejects unsupported shapes, modes, operations and trailing tokens', () => {
    for (const id of [
      '',
      'mount-flat-2000-validate',
      'mount-flat-500',
      'mount-array-1000-none',
      'type-flat-500-none-nonburst',
      'type-flat-500-validate-burst',
      'type-if-flat-500-validate-nonburst',
      'first-key-array-1000-validate',
      'rebuild-flat-500-validate',
      'mount-flat-500-validate-extra',
    ])
      expect(() => getCoreFixture(id)).toThrow('Unknown core fixture');
  });

  it('uses unchanged canonical schemas for none mounts and adds only the probe leaf to validated loads', () => {
    expect(CORE_PROBE).toEqual({
      path: '/probe',
      name: 'probe',
      typedDefault: '',
      ...probe,
    });
    expect(getCoreFixture('mount-flat-500-none').schema).toEqual(
      buildFlatSchema(500),
    );
    expect(getCoreFixture('mount-flat-500-validate').schema).toEqual(
      probed(buildFlatSchema(500)),
    );
    expect(getCoreFixture('rebuild-flat-500').schema).toEqual(
      probed(buildFlatSchema(500)),
    );
    expect(getCoreFixture('mount-array-1000-validate').schema).toEqual(
      probed(buildArraySchema(1000)),
    );
    expect(getCoreFixture('mount-nested-d5-f4-validate').schema).toEqual(
      probed(buildNestedSchema(5, 4)),
    );
  });

  it('keeps the typed leaf initial values at even length so the first key flips the marker', () => {
    expect(
      getCoreFixture('type-flat-500-validate-nonburst').schema.properties
        ?.field_000,
    ).toEqual({ type: 'string', pattern: '^(?:..)*$', default: '' });
    const items = getCoreFixture('type-array-1000-validate-nonburst').schema
      .properties?.items?.default;
    expect(Array.isArray(items) && items[0]).toMatchObject({ name: 'name-0' });
  });

  it('retains the conditional profile independently of validation mode', () => {
    const fixture = getCoreFixture('mount-if-flat-500-none');
    expect(probed(fixture.schema)).toEqual(
      getCoreFixture('mount-if-flat-500-validate').schema,
    );
    expect(Object.keys(fixture.schema.properties ?? {})).toHaveLength(501);
    expect(fixture.schema.properties?.field_0).toEqual({ type: 'string' });
    expect(fixture.schema.properties?.field_499).toEqual({ type: 'string' });
    expect(fixture.schema.properties?.kind).toEqual({
      type: 'string',
      default: 'a',
    });
    expect(fixture.schema.if).toEqual({ properties: { kind: { const: 'a' } } });
    expect(fixture.schema.then).toEqual({
      properties: { field_0: { minLength: 2 } },
    });
  });

  it('alternates validation only at the typed leaf without sharing schemas', () => {
    const typing = getCoreFixture('type-flat-500-validate-nonburst');
    const firstKey = getCoreFixture('first-key-flat-500-validate');
    expect(typing.schema).toEqual(firstKey.schema);
    expect(typing.schema).not.toBe(firstKey.schema);
    expect(typing.schema.properties?.field_000?.pattern).toBe('^(?:..)*$');
    expect(typing.schema.properties?.field_000?.default).toBe('');
    expect(typing.schema.properties?.field_001).toEqual({
      type: 'string',
      default: 'value_1',
    });
    expect(typing.schema.properties?.probe).toEqual(probe);
    const item = getCoreFixture('type-array-1000-validate-nonburst').schema
      .properties?.items?.items;
    if (!item || !('type' in item))
      throw new Error('Expected one array item schema');
    expect(item.properties?.name).toEqual({
      type: 'string',
      pattern: '^(?:..)*$',
    });
    expect(item.properties?.id).toEqual({ type: 'string' });
    expect(
      getCoreFixture('mount-flat-500-validate').schema.properties?.field_000
        ?.pattern,
    ).toBeUndefined();
  });
});
