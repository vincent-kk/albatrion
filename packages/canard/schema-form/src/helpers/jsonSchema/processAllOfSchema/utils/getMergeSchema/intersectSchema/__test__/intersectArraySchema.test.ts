import { describe, expect, test } from 'vitest';

import type { ArraySchema } from '@/schema-form/types';

import { intersectArraySchema } from '../intersectArraySchema';

describe('intersectArraySchema', () => {
  describe('Items 제약 병합 (가장 제한적인 값)', () => {
    test('minItems는 더 큰 값, maxItems는 더 작은 값 선택', () => {
      const base = { type: 'array', minItems: 1, maxItems: 10 } as ArraySchema;
      const source: Partial<ArraySchema> = { minItems: 3, maxItems: 5 };

      const result = intersectArraySchema(base, source);

      expect(result.minItems).toBe(3); // Math.max(1, 3)
      expect(result.maxItems).toBe(5); // Math.min(10, 5)
    });

    test('minContains/maxContains 처리', () => {
      const base = {
        type: 'array',
        minContains: 1,
        maxContains: 5,
      } as ArraySchema;
      const source: Partial<ArraySchema> = { minContains: 2, maxContains: 3 };

      const result = intersectArraySchema(base, source);

      expect(result.minContains).toBe(2); // Math.max(1, 2)
      expect(result.maxContains).toBe(3); // Math.min(5, 3)
    });

    test('범위 충돌 시 에러 발생', () => {
      const base = { type: 'array', minItems: 10 } as ArraySchema;
      const source: Partial<ArraySchema> = { maxItems: 5 };

      expect(() => intersectArraySchema(base, source)).toThrow(
        'Invalid array constraints: minItems (10 > 5)',
      );
    });
  });

  describe('UniqueItems 병합 (OR 결합)', () => {
    test('하나라도 true면 true', () => {
      const base = { type: 'array', uniqueItems: false } as ArraySchema;
      const source: Partial<ArraySchema> = { uniqueItems: true };

      const result = intersectArraySchema(base, source);

      expect(result.uniqueItems).toBe(true);
    });

    test('둘 다 false면 false', () => {
      const base = { type: 'array', uniqueItems: false } as ArraySchema;
      const source: Partial<ArraySchema> = { uniqueItems: false };

      const result = intersectArraySchema(base, source);

      expect(result.uniqueItems).toBe(false);
    });

    test('둘 다 true면 true', () => {
      const base = { type: 'array', uniqueItems: true } as ArraySchema;
      const source: Partial<ArraySchema> = { uniqueItems: true };

      const result = intersectArraySchema(base, source);

      expect(result.uniqueItems).toBe(true);
    });

    test('base에만 값이 있는 경우', () => {
      const base = { type: 'array', uniqueItems: true } as ArraySchema;
      const source: Partial<ArraySchema> = {};

      const result = intersectArraySchema(base, source);

      expect(result.uniqueItems).toBe(true);
    });
  });

  describe('공통 필드 처리', () => {
    describe('First-Win 필드들', () => {
      const firstWinFields = [
        'title',
        'description',
        '$comment',
        'examples',
        'default',
        'readOnly',
        'writeOnly',
        'additionalProperties',
      ] as const;

      test.each(firstWinFields)('%s 필드는 base 값 우선', (field) => {
        const baseValue = field === 'default' ? ['base'] : `base-${field}`;
        const sourceValue =
          field === 'default' ? ['source'] : `source-${field}`;

        const base = { type: 'array', [field]: baseValue } as ArraySchema;
        const source: Partial<ArraySchema> = { [field]: sourceValue } as any;

        const result = intersectArraySchema(base, source);

        expect(result[field]).toBe(baseValue);
      });
    });

    describe('Enum 교집합', () => {
      test('공통 값만 남김', () => {
        const base = {
          type: 'array',
          enum: [['a'], ['b'], ['c']],
        } as ArraySchema;
        const source: Partial<ArraySchema> = { enum: [['b'], ['c'], ['d']] };

        const result = intersectArraySchema(base, source);

        expect(result.enum).toEqual([['b'], ['c']]);
      });
    });

    describe('Required 합집합', () => {
      test('모든 required 배열 합치고 중복 제거', () => {
        const base = {
          type: 'array',
          required: ['a', 'b'],
        } as unknown as ArraySchema;
        const source: Partial<ArraySchema> = { required: ['b', 'c'] };

        const result = intersectArraySchema(base, source);

        expect(result.required).toEqual(['a', 'b', 'c']);
      });
    });
  });

  describe('Items 병합 (allOf에서 items 처리)', () => {
    test('base에 items가 없고 source에만 있는 경우', () => {
      const base = {
        type: 'array',
        title: 'Base Array',
      } as unknown as ArraySchema;
      const source: Partial<ArraySchema> = {
        items: { type: 'string' as const },
      };

      const result = intersectArraySchema(base, source);

      expect(result.items).toEqual({
        type: 'string',
      });
    });

    test('base와 source 모두 items가 있는 경우 - distributeSchema로 병합', () => {
      const base = {
        type: 'array',
        items: {
          type: 'string' as const,
          minLength: 1,
        },
      } as ArraySchema;
      const source: Partial<ArraySchema> = {
        items: {
          type: 'string' as const,
          maxLength: 50,
          pattern: '^[a-zA-Z]+$',
        },
      };

      const result = intersectArraySchema(base, source);

      expect(result.items).toEqual({
        type: 'string',
        minLength: 1,
        allOf: [
          {
            type: 'string' as const,
            maxLength: 50,
            pattern: '^[a-zA-Z]+$',
          },
        ],
      });
    });

    test('복잡한 객체 items 병합', () => {
      const base = {
        type: 'array',
        items: {
          type: 'object' as const,
          properties: {
            name: { type: 'string' as const },
            age: { type: 'number' as const, minimum: 0 },
          },
          required: ['name'],
        },
      } as ArraySchema;
      const source: Partial<ArraySchema> = {
        items: {
          type: 'object' as const,
          properties: {
            email: { type: 'string' as const, format: 'email' },
            age: { type: 'number' as const, maximum: 150 },
          },
          required: ['email'],
        },
      };

      const result = intersectArraySchema(base, source);

      expect(result.items).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number', minimum: 0 },
        },
        required: ['name'],
        allOf: [
          {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              age: { type: 'number', maximum: 150 },
            },
            required: ['email'],
          },
        ],
      });
    });

    test('중첩 배열 items 병합', () => {
      const base = {
        type: 'array',
        items: {
          type: 'array' as const,
          items: {
            type: 'string' as const,
            minLength: 1,
          },
          minItems: 1,
        },
      } as ArraySchema;
      const source: Partial<ArraySchema> = {
        items: {
          type: 'array' as const,
          items: {
            type: 'string' as const,
            maxLength: 20,
          },
          maxItems: 10,
        },
      };

      const result = intersectArraySchema(base, source);

      expect(result.items).toEqual({
        type: 'array',
        items: {
          type: 'string',
          minLength: 1,
        },
        minItems: 1,
        allOf: [
          {
            type: 'array',
            items: {
              type: 'string',
              maxLength: 20,
            },
            maxItems: 10,
          },
        ],
      });
    });

    test('다양한 items 스키마 제약 조건 병합', () => {
      const base = {
        type: 'array',
        items: {
          type: 'number' as const,
          minimum: 0,
          multipleOf: 2,
        },
      } as ArraySchema;
      const source: Partial<ArraySchema> = {
        items: {
          type: 'number' as const,
          maximum: 100,
          multipleOf: 3,
        },
      };

      const result = intersectArraySchema(base, source);

      expect(result.items).toEqual({
        type: 'number',
        minimum: 0,
        multipleOf: 2,
        allOf: [
          {
            type: 'number',
            maximum: 100,
            multipleOf: 3,
          },
        ],
      });
    });
  });

  describe('복합 시나리오', () => {
    test('모든 제약이 함께 적용되는 경우', () => {
      const base = {
        type: 'array',
        title: 'Base Title',
        minItems: 1,
        maxItems: 10,
        uniqueItems: false,
        minContains: 0,
        maxContains: 5,
      } as unknown as ArraySchema;

      const source: Partial<ArraySchema> = {
        title: 'Source Title', // 무시됨 (First-Win)
        minItems: 3,
        maxItems: 8,
        uniqueItems: true,
        minContains: 1,
        maxContains: 3,
      };

      const result = intersectArraySchema(base, source);

      expect(result).toEqual({
        type: 'array',
        title: 'Base Title',
        minItems: 3,
        maxItems: 8,
        uniqueItems: true, // OR 결합
        minContains: 1,
        maxContains: 3,
      });
    });

    test('모든 기능이 함께 적용되는 복합 시나리오 - items 포함', () => {
      const base = {
        type: 'array',
        title: 'User List',
        minItems: 1,
        maxItems: 100,
        uniqueItems: true,
        items: {
          type: 'object' as const,
          properties: {
            id: { type: 'number' as const, minimum: 1 },
            name: { type: 'string' as const, minLength: 1 },
          },
          required: ['id', 'name'],
        },
      } as ArraySchema;

      const source: Partial<ArraySchema> = {
        title: 'Extended User List', // 무시됨 (First-Win)
        minItems: 5,
        maxItems: 50,
        uniqueItems: false, // true OR false = true
        items: {
          type: 'object' as const,
          properties: {
            email: { type: 'string' as const, format: 'email' },
            name: { type: 'string' as const, maxLength: 100 },
          },
          required: ['email'],
        },
      };

      const result = intersectArraySchema(base, source);

      expect(result).toEqual({
        type: 'array',
        title: 'User List',
        minItems: 5,
        maxItems: 50,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            id: { type: 'number', minimum: 1 },
            name: { type: 'string', minLength: 1 },
          },
          required: ['id', 'name'],
          allOf: [
            {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                name: { type: 'string', maxLength: 100 },
              },
              required: ['email'],
            },
          ],
        },
      });
    });

    test('실제 allOf 사용 사례 - 배열 요소 스키마 확장', () => {
      // 기본 사용자 배열
      const base = {
        type: 'array',
        description: 'Basic user array',
        minItems: 0,
        items: {
          type: 'object' as const,
          properties: {
            username: { type: 'string' as const, pattern: '^[a-zA-Z0-9_]+$' },
          },
          required: ['username'],
        },
      } as ArraySchema;

      // 추가 검증 규칙
      const source: Partial<ArraySchema> = {
        minItems: 1, // 최소 1명은 있어야 함
        maxItems: 1000, // 최대 1000명
        uniqueItems: true, // 중복 사용자 없음
        items: {
          type: 'object' as const,
          properties: {
            username: { type: 'string' as const, minLength: 3, maxLength: 20 },
            role: { type: 'string' as const, enum: ['admin', 'user', 'guest'] },
            active: { type: 'boolean' as const, default: true },
          },
          required: ['role'],
        },
      };

      const result = intersectArraySchema(base, source);

      expect(result).toEqual({
        type: 'array',
        description: 'Basic user array',
        minItems: 1,
        maxItems: 1000,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              pattern: '^[a-zA-Z0-9_]+$',
            },
          },
          required: ['username'],
          allOf: [
            {
              type: 'object',
              properties: {
                username: { type: 'string', minLength: 3, maxLength: 20 },
                role: { type: 'string', enum: ['admin', 'user', 'guest'] },
                active: { type: 'boolean', default: true },
              },
              required: ['role'],
            },
          ],
        },
      });
    });
  });
});
