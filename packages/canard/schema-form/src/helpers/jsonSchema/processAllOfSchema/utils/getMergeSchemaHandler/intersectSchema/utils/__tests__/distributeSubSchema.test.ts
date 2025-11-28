import { describe, expect, test } from 'vitest';

import type { ArraySchema, ObjectSchema, JsonSchema } from '@/schema-form/types';

import {
  distributeAllOfProperties,
  distributeAllOfItems,
} from '../distributeSubSchema';

describe('distributeAllOfProperties', () => {
  test('does nothing when source properties is empty', () => {
    const base: ObjectSchema = { type: 'object' };
    const source: Partial<ObjectSchema> = {};

    distributeAllOfProperties(base, source);

    expect(base.properties).toBeUndefined();
  });

  test('assigns source properties when base properties is empty', () => {
    const base: ObjectSchema = { type: 'object' };
    const source: Partial<ObjectSchema> = {
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    };

    distributeAllOfProperties(base, source);

    expect(base.properties).toEqual({
      name: { type: 'string' },
      age: { type: 'number' },
    });
  });

  test('adds new property to existing properties', () => {
    const base: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };
    const source: Partial<ObjectSchema> = {
      properties: {
        age: { type: 'number' },
      },
    };

    distributeAllOfProperties(base, source);

    expect(base.properties).toEqual({
      name: { type: 'string' },
      age: { type: 'number' },
    });
  });

  test('distributes duplicate property to allOf', () => {
    const base: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };
    const source: Partial<ObjectSchema> = {
      properties: {
        name: { minLength: 3 } as JsonSchema,
      },
    };

    distributeAllOfProperties(base, source);

    expect(base.properties?.name).toEqual({
      type: 'string',
      allOf: [{ minLength: 3 }],
    });
  });

  test('handles multiple properties simultaneously', () => {
    const base: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    };
    const source: Partial<ObjectSchema> = {
      properties: {
        name: { minLength: 3 } as JsonSchema,
        email: { type: 'string', format: 'email' },
      },
    };

    distributeAllOfProperties(base, source);

    expect(base.properties).toEqual({
      name: {
        type: 'string',
        allOf: [{ minLength: 3 }],
      },
      age: { type: 'number' },
      email: { type: 'string', format: 'email' },
    });
  });

  test('original base object is mutated', () => {
    const base: ObjectSchema = { type: 'object' };
    const originalBase = base;
    const source: Partial<ObjectSchema> = {
      properties: {
        name: { type: 'string' },
      },
    };

    distributeAllOfProperties(base, source);

    expect(base).toBe(originalBase);
    expect(base.properties).toBeDefined();
  });
});

describe('distributeAllOfItems', () => {
  test('does nothing when source items is empty', () => {
    const base: ArraySchema = { type: 'array', items: { type: 'string' } };
    const source: Partial<ArraySchema> = {};

    distributeAllOfItems(base, source);

    expect(base.items).toEqual({ type: 'string' });
  });

  test('assigns source items when base items is empty', () => {
    const base = { type: 'array' } as ArraySchema;
    const source: Partial<ArraySchema> = {
      items: { type: 'string' },
    };

    distributeAllOfItems(base, source);

    expect(base.items).toEqual({ type: 'string' });
  });

  test('distributes to allOf for existing items', () => {
    const base: ArraySchema = {
      type: 'array',
      items: { type: 'string' },
    };
    const source: Partial<ArraySchema> = {
      items: { minLength: 3 } as JsonSchema,
    };

    distributeAllOfItems(base, source);

    expect(base.items).toEqual({
      type: 'string',
      allOf: [{ minLength: 3 }],
    });
  });

  test('handles complex items schema', () => {
    const base: ArraySchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
    };
    const source: Partial<ArraySchema> = {
      items: {
        required: ['name'],
      } as JsonSchema,
    };

    distributeAllOfItems(base, source);

    expect(base.items).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      allOf: [{ required: ['name'] }],
    });
  });

  test('original base object is mutated', () => {
    const base = { type: 'array' } as ArraySchema;
    const originalBase = base;
    const source: Partial<ArraySchema> = {
      items: { type: 'string' },
    };

    distributeAllOfItems(base, source);

    expect(base).toBe(originalBase);
    expect(base.items).toBeDefined();
  });

  test('continues to add to allOf on multiple calls', () => {
    const base: ArraySchema = {
      type: 'array',
      items: { type: 'string' },
    };

    distributeAllOfItems(base, { items: { minLength: 3 } as JsonSchema });
    distributeAllOfItems(base, { items: { maxLength: 10 } as JsonSchema });

    expect(base.items).toEqual({
      type: 'string',
      allOf: [{ minLength: 3 }, { maxLength: 10 }],
    });
  });
});
