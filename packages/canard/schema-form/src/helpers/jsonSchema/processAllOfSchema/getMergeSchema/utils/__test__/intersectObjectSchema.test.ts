import { describe, expect, test } from 'vitest';

import type { ObjectSchema } from '@/schema-form/types';

import { intersectObjectSchema } from '../intersectSchema/intersectObjectSchema';

describe('intersectObjectSchema', () => {
  describe('Properties 제약 병합 (가장 제한적인 값)', () => {
    test('minProperties는 더 큰 값, maxProperties는 더 작은 값 선택', () => {
      const base: ObjectSchema = {
        type: 'object',
        minProperties: 1,
        maxProperties: 10,
      };
      const source: Partial<ObjectSchema> = {
        minProperties: 3,
        maxProperties: 5,
      };

      const result = intersectObjectSchema(base, source);

      expect(result.minProperties).toBe(3); // Math.max(1, 3)
      expect(result.maxProperties).toBe(5); // Math.min(10, 5)
    });

    test('범위 충돌 시 에러 발생', () => {
      const base: ObjectSchema = { type: 'object', minProperties: 10 };
      const source: Partial<ObjectSchema> = { maxProperties: 5 };

      expect(() => intersectObjectSchema(base, source)).toThrow(
        'Invalid object constraints: minProperties (10 > 5)',
      );
    });
  });

  describe('AdditionalProperties/PatternProperties (First-Win)', () => {
    test('additionalProperties는 base 값 우선', () => {
      const base: ObjectSchema = {
        type: 'object',
        additionalProperties: false,
      };
      const source: Partial<ObjectSchema> = {
        additionalProperties: true,
      };

      const result = intersectObjectSchema(base, source);

      expect(result.additionalProperties).toBe(false);
    });

    test('patternProperties는 base 값 우선', () => {
      const basePattern = { '^[a-z]+$': { type: 'string' as const } };
      const sourcePattern = { '^[0-9]+$': { type: 'number' as const } };

      const base: ObjectSchema = {
        type: 'object',
        patternProperties: basePattern,
      };
      const source: Partial<ObjectSchema> = {
        patternProperties: sourcePattern,
      };

      const result = intersectObjectSchema(base, source);

      expect(result.patternProperties).toBe(basePattern);
    });

    test('base에 없으면 source 값 사용', () => {
      const base: ObjectSchema = { type: 'object' };
      const source: Partial<ObjectSchema> = {
        additionalProperties: { type: 'string' as const },
      };

      const result = intersectObjectSchema(base, source);

      expect(result.additionalProperties).toEqual({ type: 'string' });
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
      ] as const;

      test.each(firstWinFields)('%s 필드는 base 값 우선', (field) => {
        const baseValue =
          field === 'default' ? { base: true } : `base-${field}`;
        const sourceValue =
          field === 'default' ? { source: true } : `source-${field}`;

        const base: ObjectSchema = {
          type: 'object',
          [field]: baseValue,
        } as any;
        const source: Partial<ObjectSchema> = { [field]: sourceValue } as any;

        const result = intersectObjectSchema(base, source);

        expect(result[field]).toBe(baseValue);
      });
    });

    describe('Required 합집합', () => {
      test('모든 required 배열 합치고 중복 제거', () => {
        const base: ObjectSchema = { type: 'object', required: ['a', 'b'] };
        const source: Partial<ObjectSchema> = { required: ['b', 'c'] };

        const result = intersectObjectSchema(base, source);

        expect(result.required).toEqual(['a', 'b', 'c']);
      });
    });

    describe('Enum 교집합', () => {
      test('공통 값만 남김', () => {
        const base: ObjectSchema = {
          type: 'object',
          enum: [{ a: 1 }, { b: 2 }, { c: 3 }],
        };
        const source: Partial<ObjectSchema> = {
          enum: [{ b: 2 }, { c: 3 }, { d: 4 }],
        };

        const result = intersectObjectSchema(base, source);

        expect(result.enum).toEqual([{ b: 2 }, { c: 3 }]);
      });
    });

    describe('Const 처리', () => {
      test('같은 const 값이면 유지', () => {
        const constValue = { test: 'value' };
        const base: ObjectSchema = { type: 'object', const: constValue };
        const source: Partial<ObjectSchema> = { const: constValue };

        const result = intersectObjectSchema(base, source);

        expect(result.const).toBe(constValue);
      });

      test('다른 const 값이면 에러', () => {
        const base: ObjectSchema = { type: 'object', const: { a: 1 } };
        const source: Partial<ObjectSchema> = { const: { b: 2 } };

        expect(() => intersectObjectSchema(base, source)).toThrow(
          'Conflicting const values',
        );
      });
    });
  });

  describe('Properties 병합 (allOf에서 properties 처리)', () => {
    test('base에 properties가 없고 source에만 있는 경우', () => {
      const base: ObjectSchema = {
        type: 'object',
        title: 'Base Object',
      };
      const source: Partial<ObjectSchema> = {
        properties: {
          name: { type: 'string' as const },
          age: { type: 'number' as const },
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result.properties).toEqual({
        name: {
          type: 'string',
        },
        age: { type: 'number' },
      });
    });

    test('base와 source 모두 properties가 있는 경우 - 새로운 프로퍼티 추가', () => {
      const base: ObjectSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' as const },
          age: { type: 'number' as const },
        },
      };
      const source: Partial<ObjectSchema> = {
        properties: {
          email: { type: 'string' as const, format: 'email' },
          active: { type: 'boolean' as const },
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result.properties).toEqual({
        name: { type: 'string' },
        age: { type: 'number' },
        email: {
          type: 'string',
          format: 'email',
        },
        active: { type: 'boolean' },
      });
    });

    test('같은 프로퍼티 키가 있는 경우 - distributeSchema로 병합', () => {
      const base: ObjectSchema = {
        type: 'object',
        properties: {
          name: {
            type: 'string' as const,
            minLength: 1,
          },
          count: { type: 'number' as const },
        },
      };
      const source: Partial<ObjectSchema> = {
        properties: {
          name: {
            type: 'string' as const,
            maxLength: 50,
            pattern: '^[a-zA-Z]+$',
          },
          email: { type: 'string' as const, format: 'email' },
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result.properties?.name).toEqual({
        type: 'string',
        minLength: 1,
        allOf: [
          {
            type: 'string',
            maxLength: 50,
            pattern: '^[a-zA-Z]+$',
          },
        ],
      });
      expect(result.properties?.count).toEqual({ type: 'number' });
      expect(result.properties?.email).toEqual({
        type: 'string',
        format: 'email',
      });
    });

    test('복잡한 중첩 객체 프로퍼티 병합', () => {
      const base: ObjectSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object' as const,
            properties: {
              name: { type: 'string' as const },
              profile: {
                type: 'object' as const,
                properties: {
                  avatar: { type: 'string' as const },
                },
              },
            },
          },
        },
      };
      const source: Partial<ObjectSchema> = {
        properties: {
          user: {
            type: 'object' as const,
            properties: {
              age: { type: 'number' as const },
              profile: {
                type: 'object' as const,
                properties: {
                  bio: { type: 'string' as const },
                },
              },
            },
          },
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result.properties?.user).toEqual({
        type: 'object' as const,
        properties: {
          name: { type: 'string' as const },
          profile: {
            type: 'object' as const,
            properties: {
              avatar: { type: 'string' as const },
            },
          },
        },
        allOf: [
          {
            type: 'object' as const,
            properties: {
              age: { type: 'number' as const },
              profile: {
                type: 'object' as const,
                properties: {
                  bio: { type: 'string' as const },
                },
              },
            },
          },
        ],
      });
    });

    test('빈 properties 객체 처리', () => {
      const base: ObjectSchema = {
        type: 'object',
        properties: {},
      };
      const source: Partial<ObjectSchema> = {
        properties: {
          field: { type: 'string' as const },
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result.properties).toEqual({
        field: { type: 'string' },
      });
    });
  });

  describe('복합 시나리오', () => {
    test('모든 제약이 함께 적용되는 경우', () => {
      const base: ObjectSchema = {
        type: 'object',
        title: 'Base Title',
        minProperties: 1,
        maxProperties: 10,
        additionalProperties: false,
        required: ['a', 'b'],
      };

      const source: Partial<ObjectSchema> = {
        title: 'Source Title', // 무시됨 (First-Win)
        minProperties: 3,
        maxProperties: 8,
        additionalProperties: true, // 무시됨 (First-Win)
        required: ['b', 'c'],
      };

      const result = intersectObjectSchema(base, source);

      expect(result).toEqual({
        type: 'object',
        title: 'Base Title',
        minProperties: 3,
        maxProperties: 8,
        additionalProperties: false,
        required: ['a', 'b', 'c'],
      });
    });

    test('모든 기능이 함께 적용되는 복합 시나리오 - properties 포함', () => {
      const base: ObjectSchema = {
        type: 'object',
        title: 'User Schema',
        minProperties: 2,
        maxProperties: 10,
        required: ['name', 'email'],
        properties: {
          name: {
            type: 'string' as const,
            minLength: 1,
            pattern: '^[A-Za-z]+$',
          },
          settings: {
            type: 'object' as const,
            properties: {
              theme: { type: 'string' as const },
            },
          },
        },
      };

      const source: Partial<ObjectSchema> = {
        title: 'Extended User Schema', // 무시됨 (First-Win)
        minProperties: 3,
        maxProperties: 8,
        required: ['email', 'active'],
        properties: {
          name: {
            type: 'string' as const,
            maxLength: 50,
          },
          email: {
            type: 'string' as const,
            format: 'email',
          },
          settings: {
            type: 'object' as const,
            properties: {
              notifications: { type: 'boolean' as const },
            },
          },
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result).toEqual({
        type: 'object',
        title: 'User Schema',
        minProperties: 3,
        maxProperties: 8,
        required: ['name', 'email', 'active'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            pattern: '^[A-Za-z]+$',
            allOf: [
              {
                type: 'string',
                maxLength: 50,
              },
            ],
          },
          email: {
            type: 'string',
            format: 'email',
          },
          settings: {
            type: 'object',
            properties: {
              theme: { type: 'string' },
            },
            allOf: [
              {
                type: 'object',
                properties: {
                  notifications: { type: 'boolean' },
                },
              },
            ],
          },
        },
      });
    });
  });
});
