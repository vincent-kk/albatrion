import { describe, expect, test } from 'vitest';

import type { ArraySchema, ObjectSchema, JsonSchema } from '@/schema-form/types';

import {
  distributeAllOfProperties,
  distributeAllOfItems,
} from '../distributeSubSchema';

describe('distributeAllOfProperties', () => {
  test('source properties가 없으면 아무것도 하지 않음', () => {
    const base: ObjectSchema = { type: 'object' };
    const source: Partial<ObjectSchema> = {};

    distributeAllOfProperties(base, source);

    expect(base.properties).toBeUndefined();
  });

  test('base properties가 없으면 source properties를 할당', () => {
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

  test('기존 properties에 새로운 property 추가', () => {
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

  test('중복 property는 allOf로 분배', () => {
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

  test('여러 property를 동시에 처리', () => {
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

  test('원본 base 객체가 변경됨 (mutation)', () => {
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
  test('source items가 없으면 아무것도 하지 않음', () => {
    const base: ArraySchema = { type: 'array', items: { type: 'string' } };
    const source: Partial<ArraySchema> = {};

    distributeAllOfItems(base, source);

    expect(base.items).toEqual({ type: 'string' });
  });

  test('base items가 없으면 source items를 할당', () => {
    const base = { type: 'array' } as ArraySchema;
    const source: Partial<ArraySchema> = {
      items: { type: 'string' },
    };

    distributeAllOfItems(base, source);

    expect(base.items).toEqual({ type: 'string' });
  });

  test('기존 items에 allOf로 분배', () => {
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

  test('복잡한 items 스키마 처리', () => {
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

  test('원본 base 객체가 변경됨 (mutation)', () => {
    const base = { type: 'array' } as ArraySchema;
    const originalBase = base;
    const source: Partial<ArraySchema> = {
      items: { type: 'string' },
    };

    distributeAllOfItems(base, source);

    expect(base).toBe(originalBase);
    expect(base.items).toBeDefined();
  });

  test('여러 번 호출하면 allOf에 계속 추가', () => {
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
