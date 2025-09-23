import { describe, expect, test } from 'vitest';

import type {
  ArraySchema,
  BooleanSchema,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
} from '@/schema-form/types';

import { processAllOfSchema } from '../processAllOfSchema/processAllOfSchema';

describe('processAllOfSchema', () => {
  describe('기본 동작', () => {
    test('allOf가 없으면 원본 스키마 반환', () => {
      const schema: StringSchema = {
        type: 'string',
        title: 'Test Schema',
        minLength: 1,
      };

      const result = processAllOfSchema(schema);

      expect(result).toBe(schema); // 원본과 동일한 참조
    });

    test('allOf가 빈 배열이면 원본 스키마 반환', () => {
      const schema: StringSchema = {
        type: 'string',
        title: 'Test Schema',
        allOf: [],
      };

      const result = processAllOfSchema(schema);

      expect(result).toBe(schema); // 원본과 동일한 참조
    });

    test('타입이 없으면 원본 스키마 반환', () => {
      const schema = {
        title: 'Test Schema',
        allOf: [{ minLength: 1 }],
      } as any;

      const result = processAllOfSchema(schema);

      expect(result).toBe(schema); // 원본과 동일한 참조
    });

    test('지원하지 않는 타입이면 원본 스키마 반환', () => {
      const schema = {
        type: 'unknown' as any,
        title: 'Test Schema',
        allOf: [{ minLength: 1 }],
      } as any;

      const result = processAllOfSchema(schema);

      expect(result).toBe(schema); // 원본과 동일한 참조
    });
  });

  describe('String 스키마 allOf 병합', () => {
    test('단일 allOf 항목 병합', () => {
      const schema: StringSchema = {
        type: 'string',
        title: 'Base String',
        minLength: 1,
        allOf: [
          {
            type: 'string',
            maxLength: 50,
            pattern: '^[a-zA-Z]+$',
          },
        ],
      };

      const result = processAllOfSchema(schema) as StringSchema;

      expect(result).not.toBe(schema); // 새로운 객체
      expect(result).toEqual({
        type: 'string',
        title: 'Base String',
        minLength: 1,
        maxLength: 50,
        pattern: '^[a-zA-Z]+$',
      });
    });

    test('다중 allOf 항목 순차 병합', () => {
      const schema: StringSchema = {
        type: 'string',
        title: 'Base String',
        minLength: 1,
        allOf: [
          {
            type: 'string',
            maxLength: 50,
          },
          {
            type: 'string',
            pattern: '^[a-zA-Z]+$',
          },
          {
            type: 'string',
            description: 'Final description',
          },
        ],
      };

      const result = processAllOfSchema(schema) as StringSchema;

      expect(result).toEqual({
        type: 'string',
        title: 'Base String', // First-Win
        description: 'Final description', // 마지막 항목에서 추가
        minLength: 1,
        maxLength: 50,
        pattern: '^[a-zA-Z]+$',
      });
    });

    test('패턴 AND 결합', () => {
      const schema: StringSchema = {
        type: 'string',
        pattern: '^[A-Z]',
        allOf: [
          {
            type: 'string',
            pattern: '[a-z]$',
          },
          {
            type: 'string',
            pattern: '.{5,}',
          },
        ],
      };

      const result = processAllOfSchema(schema) as StringSchema;

      expect(result.pattern).toBe('(?=(?=^[A-Z])(?=[a-z]$))(?=.{5,})');
    });
  });

  describe('Number 스키마 allOf 병합', () => {
    test('숫자 제약 조건 병합', () => {
      const schema: NumberSchema = {
        type: 'number',
        minimum: 0,
        allOf: [
          {
            type: 'number',
            maximum: 100,
          },
          {
            type: 'number',
            multipleOf: 5,
          },
        ],
      };

      const result = processAllOfSchema(schema) as NumberSchema;

      expect(result).toEqual({
        type: 'number',
        minimum: 0,
        maximum: 100,
        multipleOf: 5,
      });
    });

    test('multipleOf LCM 계산', () => {
      const schema: NumberSchema = {
        type: 'number',
        multipleOf: 6,
        allOf: [
          {
            type: 'number',
            multipleOf: 8,
          },
          {
            type: 'number',
            multipleOf: 9,
          },
        ],
      };

      const result = processAllOfSchema(schema) as NumberSchema;

      // LCM(6, 8) = 24, LCM(24, 9) = 72
      expect(result.multipleOf).toBe(72);
    });
  });

  describe('Array 스키마 allOf 병합', () => {
    test('배열 제약 조건 병합', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        allOf: [
          {
            type: 'array',
            maxItems: 10,
            uniqueItems: true,
          },
          {
            minItems: 2, // type 없이 병합
          },
        ],
      };

      const result = processAllOfSchema(schema) as ArraySchema;

      expect(result).toEqual({
        type: 'array',
        items: { type: 'string' },
        minItems: 2, // Math.max(1, 2)
        maxItems: 10,
        uniqueItems: true,
      });
    });

    test('복잡한 items 병합', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
          },
          required: ['name'],
        },
        allOf: [
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                name: { type: 'string', maxLength: 50 },
              },
              required: ['email'],
            },
          },
        ],
      };

      const result = processAllOfSchema(schema) as ArraySchema;

      expect(result.items).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
        },
        required: ['name'],
        allOf: [
          {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              name: { type: 'string', maxLength: 50 },
            },
            required: ['email'],
          },
        ],
      });
    });
  });

  describe('Object 스키마 allOf 병합', () => {
    test('객체 제약 조건 병합', () => {
      const schema: ObjectSchema = {
        type: 'object',
        minProperties: 1,
        required: ['name'],
        allOf: [
          {
            type: 'object',
            maxProperties: 10,
            required: ['email'],
          },
          {
            type: 'object',
            additionalProperties: false,
            required: ['active'],
          },
        ],
      };

      const result = processAllOfSchema(schema) as ObjectSchema;

      expect(result).toEqual({
        type: 'object',
        minProperties: 1,
        maxProperties: 10,
        additionalProperties: false,
        required: ['name', 'email', 'active'],
      });
    });

    test('properties 병합', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          count: { type: 'number' },
        },
        allOf: [
          {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              name: { type: 'string', maxLength: 50 },
            },
          },
          {
            type: 'object',
            properties: {
              active: { type: 'boolean' },
            },
          },
        ],
      };

      const result = processAllOfSchema(schema) as ObjectSchema;

      expect(result.properties).toEqual({
        name: {
          type: 'string',
          minLength: 1,
          allOf: [
            {
              type: 'string',
              maxLength: 50,
            },
          ],
        },
        count: { type: 'number' },
        email: {
          type: 'string',
          format: 'email',
        },
        active: { type: 'boolean' },
      });
    });
  });

  describe('Boolean 스키마 allOf 병합', () => {
    test('Boolean 스키마 병합', () => {
      const schema: BooleanSchema = {
        type: 'boolean',
        title: 'Base Boolean',
        allOf: [
          {
            type: 'boolean',
            description: 'Boolean description',
          },
          {
            type: 'boolean',
            default: true,
          },
        ],
      };

      const result = processAllOfSchema(schema) as BooleanSchema;

      expect(result).toEqual({
        type: 'boolean',
        title: 'Base Boolean', // First-Win
        description: 'Boolean description',
        default: true,
      });
    });
  });

  describe('Null 스키마 allOf 병합', () => {
    test('Null 스키마 병합', () => {
      const schema: NullSchema = {
        type: 'null',
        title: 'Base Null',
        allOf: [
          {
            type: 'null',
            description: 'Null description',
          },
        ],
      };

      const result = processAllOfSchema(schema) as NullSchema;

      expect(result).toEqual({
        type: 'null',
        title: 'Base Null', // First-Win
        description: 'Null description',
      });
    });
  });

  describe('에러 처리', () => {
    test('타입 충돌 시 에러 발생', () => {
      const schema: StringSchema = {
        type: 'string',
        allOf: [
          {
            type: 'number', // 타입 충돌
          },
        ],
      };

      // 실제로는 타입이 다른 경우 에러가 발생할 수 있지만,
      // 기본 스키마에서 allOf 항목으로 유효하지 않은 타입이 대신 무시되는 경우가 있음
      expect(() => processAllOfSchema(schema)).toThrow(
        'Type cannot be redefined in allOf schema. It must either be omitted or match the parent schema type.',
      );
    });

    test('allOf 항목에 type이 undefined인 경우 정상 처리', () => {
      const schema: StringSchema = {
        type: 'string',
        minLength: 1,
        allOf: [
          {
            type: undefined, // type이 undefined
            maxLength: 50,
            pattern: '^[a-z]+$',
          },
        ],
      };

      const result = processAllOfSchema(schema) as StringSchema;

      expect(result).toEqual({
        type: 'string',
        minLength: 1,
        maxLength: 50,
        pattern: '^[a-z]+$',
      });
    });

    test('allOf 항목에 type이 없는 경우 정상 처리', () => {
      const schema: NumberSchema = {
        type: 'number',
        minimum: 0,
        allOf: [
          {
            // type 속성 없음
            maximum: 100,
            multipleOf: 5,
          },
        ],
      };

      const result = processAllOfSchema(schema) as NumberSchema;

      expect(result).toEqual({
        type: 'number',
        minimum: 0,
        maximum: 100,
        multipleOf: 5,
      });
    });

    test('allOf 항목의 type이 base와 동일한 경우 정상 처리', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        allOf: [
          {
            type: 'object', // 동일한 type
            properties: {
              email: { type: 'string', format: 'email' },
            },
            required: ['email'],
          },
        ],
      };

      const result = processAllOfSchema(schema) as ObjectSchema;

      expect(result).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
        required: ['email'],
      });
    });

    test('여러 allOf 항목 중 하나라도 type이 다르면 에러', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: { type: 'string' },
        allOf: [
          {
            type: 'array', // 동일한 type
            minItems: 1,
          },
          {
            // type 없음 - OK
            maxItems: 10,
          },
          {
            type: 'object', // 다른 type - 에러!
            properties: {},
          },
        ],
      };

      expect(() => processAllOfSchema(schema)).toThrow(
        'Type cannot be redefined in allOf schema',
      );
    });

    test('각 타입별 충돌 검증', () => {
      // string -> number
      expect(() =>
        processAllOfSchema({
          type: 'string',
          allOf: [{ type: 'number' }],
        }),
      ).toThrow('Type cannot be redefined');

      // number -> boolean
      expect(() =>
        processAllOfSchema({
          type: 'number',
          allOf: [{ type: 'boolean' }],
        }),
      ).toThrow('Type cannot be redefined');

      // boolean -> null
      expect(() =>
        processAllOfSchema({
          type: 'boolean',
          allOf: [{ type: 'null' }],
        }),
      ).toThrow('Type cannot be redefined');

      // array -> object
      expect(() =>
        processAllOfSchema({
          type: 'array',
          items: { type: 'string' }, // array type requires items property
          allOf: [{ type: 'object' }],
        } as ArraySchema),
      ).toThrow('Type cannot be redefined');

      // object -> string
      expect(() =>
        processAllOfSchema({
          type: 'object',
          allOf: [{ type: 'string' }],
        }),
      ).toThrow('Type cannot be redefined');
    });

    test('integer와 number 타입 병합, integer 타입 우선', () => {
      const schema: NumberSchema = {
        type: 'integer',
        minimum: 0,
        allOf: [
          {
            type: 'number',
            maximum: 100,
          },
        ],
      };
      const result = processAllOfSchema(schema);
      expect(result.type).toBe('integer');
    });

    test('const 충돌 시 에러 발생', () => {
      const schema: StringSchema = {
        type: 'string',
        const: 'value1',
        allOf: [
          {
            type: 'string',
            const: 'value2', // const 충돌
          },
        ],
      };

      expect(() => processAllOfSchema(schema)).toThrow(
        'Conflicting const values',
      );
    });

    test('범위 충돌 시 에러 발생', () => {
      const schema: NumberSchema = {
        type: 'number',
        minimum: 10,
        allOf: [
          {
            type: 'number',
            maximum: 5, // 범위 충돌
          },
        ],
      };

      expect(() => processAllOfSchema(schema)).toThrow(
        'Invalid number constraints: minimum',
      );
    });
  });

  describe('실제 사용 사례', () => {
    test('기본 사용자 스키마 확장', () => {
      const schema: ObjectSchema = {
        type: 'object',
        title: 'User Schema',
        properties: {
          name: { type: 'string', minLength: 1 },
          age: { type: 'number', minimum: 0 },
        },
        required: ['name'],
        allOf: [
          {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              name: { type: 'string', maxLength: 50 },
            },
            required: ['email'],
          },
          {
            type: 'object',
            properties: {
              active: { type: 'boolean', default: true },
            },
          },
        ],
      };

      const result = processAllOfSchema(schema) as ObjectSchema;

      expect(result).toEqual({
        type: 'object',
        title: 'User Schema',
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            allOf: [
              {
                type: 'string',
                maxLength: 50,
              },
            ],
          },
          age: { type: 'number', minimum: 0 },
          email: {
            type: 'string',
            format: 'email',
          },
          active: {
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'email'],
      });
    });

    test('중첩된 allOf 처리', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          nested: {
            type: 'object',
            properties: {
              value: { type: 'string' },
            },
            allOf: [
              {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                },
              },
            ],
          },
        },
        allOf: [
          {
            type: 'object',
            properties: {
              nested: {
                type: 'object',
                properties: {
                  count: { type: 'number' },
                },
              },
            },
          },
        ],
      };

      const result = processAllOfSchema(schema) as ObjectSchema;

      // 중첩된 allOf는 이 함수에서 처리하지 않음 (별도 처리 필요)
      expect(result.properties?.nested).toEqual({
        type: 'object',
        properties: {
          value: { type: 'string' },
        },
        allOf: [
          {
            type: 'object',
            properties: {
              description: { type: 'string' },
            },
          },
          {
            type: 'object',
            properties: {
              count: { type: 'number' },
            },
          },
        ],
      });
    });
  });

  describe('원본 스키마 보존', () => {
    test('원본 스키마가 변경되지 않음', () => {
      const originalSchema: StringSchema = {
        type: 'string',
        title: 'Original',
        minLength: 1,
        allOf: [
          {
            type: 'string',
            maxLength: 50,
          },
        ],
      };

      const clonedSchema = JSON.parse(JSON.stringify(originalSchema));
      const result = processAllOfSchema(originalSchema);

      // 원본은 변경되지 않음
      expect(originalSchema).toEqual(clonedSchema);
      // 결과는 다름
      expect(result).not.toBe(originalSchema);
      expect(result).toEqual({
        type: 'string',
        title: 'Original',
        minLength: 1,
        maxLength: 50,
      });
    });
  });
});
