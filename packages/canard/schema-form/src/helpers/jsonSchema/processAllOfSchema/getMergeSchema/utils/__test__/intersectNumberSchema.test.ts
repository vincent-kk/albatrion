import { describe, expect, test } from 'vitest';

import type { NumberSchema } from '@/schema-form/types';

import { intersectNumberSchema } from '../intersectSchema/intersectNumberSchema';

describe('intersectNumberSchema', () => {
  describe('Min/Max 범위 병합 (가장 제한적인 값)', () => {
    test('minimum은 더 큰 값, maximum은 더 작은 값 선택', () => {
      const base: NumberSchema = { type: 'number', minimum: 0, maximum: 100 };
      const source: Partial<NumberSchema> = { minimum: 10, maximum: 50 };

      const result = intersectNumberSchema(base, source);

      expect(result.minimum).toBe(10); // Math.max(0, 10)
      expect(result.maximum).toBe(50); // Math.min(100, 50)
    });

    test('exclusiveMinimum/exclusiveMaximum 처리', () => {
      const base: NumberSchema = {
        type: 'number',
        exclusiveMinimum: 0,
        exclusiveMaximum: 100,
      };
      const source: Partial<NumberSchema> = {
        exclusiveMinimum: 10,
        exclusiveMaximum: 50,
      };

      const result = intersectNumberSchema(base, source);

      expect(result.exclusiveMinimum).toBe(10); // Math.max(0, 10)
      expect(result.exclusiveMaximum).toBe(50); // Math.min(100, 50)
    });

    test('범위 충돌 시 에러 발생', () => {
      const base: NumberSchema = { type: 'number', minimum: 100 };
      const source: Partial<NumberSchema> = { maximum: 50 };

      expect(() => intersectNumberSchema(base, source)).toThrow(
        'Invalid number constraints: minimum (100 > 50)',
      );
    });

    test('exclusive와 inclusive 범위 혼합', () => {
      const base: NumberSchema = {
        type: 'number',
        minimum: 0,
        exclusiveMaximum: 100,
      };
      const source: Partial<NumberSchema> = {
        exclusiveMinimum: 10,
        maximum: 50,
      };

      const result = intersectNumberSchema(base, source);

      expect(result.minimum).toBe(0);
      expect(result.exclusiveMinimum).toBe(10);
      expect(result.maximum).toBe(50);
      expect(result.exclusiveMaximum).toBe(100);
    });
  });

  describe('MultipleOf 병합 (최소공배수)', () => {
    test('두 배수의 최소공배수 계산', () => {
      const base: NumberSchema = { type: 'number', multipleOf: 2 };
      const source: Partial<NumberSchema> = { multipleOf: 3 };

      const result = intersectNumberSchema(base, source);

      expect(result.multipleOf).toBe(6); // lcm(2, 3)
    });

    test('같은 배수인 경우', () => {
      const base: NumberSchema = { type: 'number', multipleOf: 5 };
      const source: Partial<NumberSchema> = { multipleOf: 5 };

      const result = intersectNumberSchema(base, source);

      expect(result.multipleOf).toBe(5);
    });

    test('소수 배수 처리', () => {
      const base: NumberSchema = { type: 'number', multipleOf: 0.1 };
      const source: Partial<NumberSchema> = { multipleOf: 0.2 };

      const result = intersectNumberSchema(base, source);

      expect(result.multipleOf).toBe(0.2); // lcm(0.1, 0.2)
    });
  });

  describe('공통 필드 처리', () => {
    describe('type 처리', () => {
      test('integer와 number 타입 처리', () => {
        const base: NumberSchema = { type: 'number' };
        const source: Partial<NumberSchema> = { type: 'integer' };

        const result = intersectNumberSchema(base, source);

        expect(result.type).toBe('integer');
      });

      test('number와 integer 타입 처리', () => {
        const base: NumberSchema = { type: 'integer' };
        const source: Partial<NumberSchema> = { type: 'number' };

        const result = intersectNumberSchema(base, source);

        expect(result.type).toBe('integer');
      });

      test('type이 없으면 base 타입 유지', () => {
        const base: NumberSchema = { type: 'number' };
        const source: Partial<NumberSchema> = {};

        const result = intersectNumberSchema(base, source);

        expect(result.type).toBe('number');
      });
    });

    describe('First-Win 필드들', () => {
      const firstWinFields = [
        'title',
        'description',
        '$comment',
        'examples',
        'default',
        'readOnly',
        'writeOnly',
        'format',
      ] as const;

      test.each(firstWinFields)('%s 필드는 base 값 우선', (field) => {
        const baseValue = field === 'default' ? 42 : `base-${field}`;
        const sourceValue = field === 'default' ? 84 : `source-${field}`;

        const base: NumberSchema = {
          type: 'number',
          [field]: baseValue,
        } as any;
        const source: Partial<NumberSchema> = { [field]: sourceValue } as any;

        const result = intersectNumberSchema(base, source);

        expect(result[field]).toBe(baseValue);
      });
    });

    describe('Enum 교집합', () => {
      test('공통 값만 남김', () => {
        const base: NumberSchema = { type: 'number', enum: [1, 2, 3] };
        const source: Partial<NumberSchema> = { enum: [2, 3, 4] };

        const result = intersectNumberSchema(base, source);

        expect(result.enum).toEqual([2, 3]);
      });

      test('교집합이 빈 배열이면 에러', () => {
        const base: NumberSchema = { type: 'number', enum: [1, 2] };
        const source: Partial<NumberSchema> = { enum: [3, 4] };

        expect(() => intersectNumberSchema(base, source)).toThrow(
          'Enum values must have at least one common value',
        );
      });
    });

    describe('Const 처리', () => {
      test('같은 const 값이면 유지', () => {
        const base: NumberSchema = { type: 'number', const: 42 };
        const source: Partial<NumberSchema> = { const: 42 };

        const result = intersectNumberSchema(base, source);

        expect(result.const).toBe(42);
      });

      test('다른 const 값이면 에러', () => {
        const base: NumberSchema = { type: 'number', const: 42 };
        const source: Partial<NumberSchema> = { const: 84 };

        expect(() => intersectNumberSchema(base, source)).toThrow(
          'Conflicting const values: 42 vs 84',
        );
      });
    });
  });

  describe('복합 시나리오', () => {
    test('모든 제약이 함께 적용되는 경우', () => {
      const base: NumberSchema = {
        type: 'number',
        title: 'Base Title',
        minimum: 0,
        maximum: 100,
        multipleOf: 2,
        enum: [2, 4, 6, 8, 10],
      };

      const source: Partial<NumberSchema> = {
        title: 'Source Title', // 무시됨 (First-Win)
        minimum: 5,
        maximum: 50,
        multipleOf: 3,
        enum: [6, 8, 10, 12],
      };

      const result = intersectNumberSchema(base, source);

      expect(result).toEqual({
        type: 'number',
        title: 'Base Title',
        minimum: 5,
        maximum: 50,
        multipleOf: 6, // lcm(2, 3)
        enum: [6, 8, 10], // 교집합
      });
    });
  });
});
