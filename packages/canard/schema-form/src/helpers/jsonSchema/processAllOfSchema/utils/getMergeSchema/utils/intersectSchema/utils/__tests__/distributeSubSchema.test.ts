import { describe, expect, test } from 'vitest';

import type { JsonSchema } from '@/schema-form/types';

import { distributeSubSchema } from '../distributeSubSchema';

describe('distributeSubSchema', () => {
  test('source를 base의 allOf 배열에 추가', () => {
    const base: JsonSchema = { type: 'string' };
    const source: Partial<JsonSchema> = { minLength: 3 };

    distributeSubSchema(base, source);

    expect(base.allOf).toEqual([{ minLength: 3 }]);
  });

  test('기존 allOf 배열이 있으면 추가', () => {
    const base: JsonSchema = {
      type: 'string',
      allOf: [{ minLength: 2 }],
    };
    const source: Partial<JsonSchema> = { maxLength: 10 };

    distributeSubSchema(base, source);

    expect(base.allOf).toEqual([{ minLength: 2 }, { maxLength: 10 }]);
  });

  test('여러 번 호출하면 계속 추가', () => {
    const base: JsonSchema = { type: 'string' };

    distributeSubSchema(base, { minLength: 3 });
    distributeSubSchema(base, { maxLength: 10 });
    distributeSubSchema(base, { pattern: '^[a-z]+$' });

    expect(base.allOf).toEqual([
      { minLength: 3 },
      { maxLength: 10 },
      { pattern: '^[a-z]+$' },
    ]);
  });

  test('source에 type이 없으면 정상 추가', () => {
    const base: JsonSchema = { type: 'number' };
    const source: Partial<JsonSchema> = { minimum: 0, maximum: 100 };

    distributeSubSchema(base, source);

    expect(base.allOf).toEqual([{ minimum: 0, maximum: 100 }]);
  });

  test('source type이 base type과 동일하면 정상 추가', () => {
    const base: JsonSchema = { type: 'string' };
    const source: Partial<JsonSchema> = { type: 'string', minLength: 5 };

    distributeSubSchema(base, source);

    expect(base.allOf).toEqual([{ type: 'string', minLength: 5 }]);
  });

  test('복잡한 스키마 처리', () => {
    const base: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };

    const source1: Partial<JsonSchema> = {
      required: ['name'],
    };

    const source2: Partial<JsonSchema> = {
      properties: {
        age: { type: 'number' },
      },
    };

    distributeSubSchema(base, source1);
    distributeSubSchema(base, source2);

    expect(base.allOf).toEqual([
      { required: ['name'] },
      { properties: { age: { type: 'number' } } },
    ]);
  });

  test('빈 source 처리', () => {
    const base: JsonSchema = { type: 'string' };
    const source: Partial<JsonSchema> = {};

    distributeSubSchema(base, source);

    expect(base.allOf).toEqual([{}]);
  });

  test('배열 타입 스키마', () => {
    const base: JsonSchema = {
      type: 'array',
      items: { type: 'string' },
    };

    const source: Partial<JsonSchema> = {
      minItems: 1,
      maxItems: 10,
    };

    distributeSubSchema(base, source);

    expect(base.allOf).toEqual([{ minItems: 1, maxItems: 10 }]);
  });

  test('undefined type 처리', () => {
    const base: JsonSchema = { type: 'integer' };
    const source: Partial<JsonSchema> = {
      type: undefined,
      minimum: 0,
    };

    distributeSubSchema(base, source);

    expect(base.allOf).toEqual([{ type: undefined, minimum: 0 }]);
  });

  test('원본 base 객체가 변경됨 (mutation)', () => {
    const base: JsonSchema = { type: 'string' };
    const originalBase = base;

    distributeSubSchema(base, { minLength: 5 });

    expect(base).toBe(originalBase);
    expect(base.allOf).toBeDefined();
  });

  test('제네릭 타입 지원', () => {
    type CustomSchema = JsonSchema & {
      customField?: string;
    };

    const base: CustomSchema = {
      type: 'string',
      customField: 'test',
    };

    const source: Partial<JsonSchema> = { minLength: 3 };

    distributeSubSchema(base, source);

    expect(base.allOf).toEqual([{ minLength: 3 }]);
    expect(base.customField).toBe('test');
  });
});
