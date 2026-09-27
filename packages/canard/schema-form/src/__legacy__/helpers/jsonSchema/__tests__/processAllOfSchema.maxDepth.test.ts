import { describe, expect, test } from 'vitest';

import type {
  ArraySchema,
  ObjectSchema,
  StringSchema,
} from '@/schema-form/types';

import { processAllOfSchema } from '../processAllOfSchema/processAllOfSchema';

describe('processAllOfSchema - maxDepth 최적화 검증', () => {
  describe('원본 스키마 보호 검증', () => {
    test('Object Schema: properties의 개별 스키마 객체가 보호됨', () => {
      const nameSchema = { type: 'string' as const, minLength: 1 };
      const emailSchema = { type: 'string' as const, format: 'email' as const };

      const originalSchema: ObjectSchema = {
        type: 'object',
        properties: {
          name: nameSchema,
          email: emailSchema,
        },
        required: ['name'],
        allOf: [
          {
            type: 'object',
            properties: {
              name: { type: 'string', maxLength: 50 },
              age: { type: 'number', minimum: 0 },
            },
            required: ['email'],
          },
        ],
      };

      // 원본 스키마의 참조를 보존
      const originalNameRef = originalSchema.properties!.name;
      const originalEmailRef = originalSchema.properties!.email;

      const result = processAllOfSchema(originalSchema) as ObjectSchema;

      // 결과 검증: allOf가 올바르게 병합됨
      expect(result.properties!.name).toEqual({
        type: 'string',
        minLength: 1,
        allOf: [{ type: 'string', maxLength: 50 }],
      });

      // 핵심 검증: 원본 스키마의 properties.name이 변경되지 않음
      expect(originalNameRef).toEqual({ type: 'string', minLength: 1 });
      expect(originalNameRef).not.toHaveProperty('allOf');

      // 원본 스키마의 properties.email도 변경되지 않음
      expect(originalEmailRef).toEqual({ type: 'string', format: 'email' });

      // 결과와 원본의 properties.name은 다른 객체
      expect(result.properties!.name).not.toBe(originalNameRef);
      expect(result.properties!.email).not.toBe(originalEmailRef); // maxDepth=3이므로 모든 properties가 복사됨
    });

    test('Array Schema: items 스키마 객체가 보호됨', () => {
      const itemsSchema = {
        type: 'object' as const,
        properties: {
          value: { type: 'string' as const },
        },
        required: ['value'],
      };

      const originalSchema: ArraySchema = {
        type: 'array',
        items: itemsSchema,
        minItems: 1,
        allOf: [
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string' },
              },
            },
            maxItems: 10,
          },
        ],
      };

      // 원본 items 참조 보존
      const originalItemsRef = originalSchema.items;

      const result = processAllOfSchema(originalSchema) as ArraySchema;

      // 결과 검증: items에 allOf가 추가됨
      expect(result.items).toEqual({
        type: 'object',
        properties: {
          value: { type: 'string' },
        },
        required: ['value'],
        allOf: [
          {
            type: 'object',
            properties: {
              description: { type: 'string' },
            },
          },
        ],
      });

      // 핵심 검증: 원본 items가 변경되지 않음
      expect(originalItemsRef).toEqual({
        type: 'object',
        properties: {
          value: { type: 'string' },
        },
        required: ['value'],
      });
      expect(originalItemsRef).not.toHaveProperty('allOf');

      // 결과와 원본의 items는 다른 객체
      expect(result.items).not.toBe(originalItemsRef);
    });

    test('String Schema: 최상위 레벨만 복사되어 보호됨', () => {
      const originalSchema: StringSchema = {
        type: 'string',
        minLength: 1,
        title: 'Original Title',
        allOf: [
          {
            type: 'string',
            maxLength: 50,
            pattern: '^[a-zA-Z]+$',
          },
        ],
      };

      // 원본 스키마 전체 복사본 생성 (비교용)
      const originalSchemaCopy = JSON.parse(JSON.stringify(originalSchema));

      const result = processAllOfSchema(originalSchema) as StringSchema;

      // 결과 검증
      expect(result).toEqual({
        type: 'string',
        title: 'Original Title',
        minLength: 1,
        maxLength: 50,
        pattern: '^[a-zA-Z]+$',
      });

      // 핵심 검증: 원본 스키마가 전혀 변경되지 않음
      expect(originalSchema).toEqual(originalSchemaCopy);
      expect(originalSchema).toHaveProperty('allOf'); // allOf는 여전히 존재

      // 결과는 다른 객체
      expect(result).not.toBe(originalSchema);
    });
  });

  describe('허용된 참조 공유 검증', () => {
    test('Object Schema: 깊은 중첩 스키마는 참조 공유 허용', () => {
      const deepNestedSchema = {
        type: 'object' as const,
        properties: {
          deepValue: { type: 'string' as const },
        },
      };

      const originalSchema: ObjectSchema = {
        type: 'object',
        properties: {
          nested: {
            type: 'object',
            properties: {
              deep: deepNestedSchema, // 4단계 깊이
            },
          },
        },
        allOf: [
          {
            type: 'object',
            properties: {
              nested: {
                type: 'object',
                properties: {
                  shallow: { type: 'string' },
                },
              },
            },
          },
        ],
      };

      const originalDeepRef = deepNestedSchema;

      const result = processAllOfSchema(originalSchema) as ObjectSchema;

      // 4단계 깊이의 스키마는 참조 공유 허용 (maxDepth=3이므로)
      const resultDeepNested = (result.properties!.nested as any).properties
        .deep;
      expect(resultDeepNested).toBe(originalDeepRef);

      // 하지만 3단계까지는 복사됨
      expect(result.properties!.nested).not.toBe(
        originalSchema.properties!.nested,
      );
    });

    test('Array Schema: items 내부 깊은 스키마는 참조 공유 허용', () => {
      const deepPropertySchema = { type: 'string' as const, minLength: 1 };

      const originalSchema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            deep: deepPropertySchema, // 3단계 깊이
          },
        },
        allOf: [
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                shallow: { type: 'number' },
              },
            },
          },
        ],
      };

      const originalDeepRef = deepPropertySchema;

      const result = processAllOfSchema(originalSchema) as ArraySchema;

      // 3단계 깊이의 스키마는 참조 공유 허용 (maxDepth=2이므로)
      const resultDeepProperty = (result.items as any).properties.deep;
      expect(resultDeepProperty).toBe(originalDeepRef);

      // 하지만 2단계까지는 복사됨
      expect(result.items).not.toBe(originalSchema.items);
    });
  });

  describe('복잡한 시나리오 검증', () => {
    test('중첩된 Object Schema에서 여러 레벨 보호', () => {
      const level3Schema = { type: 'string' as const };
      const level2Schema = {
        type: 'object' as const,
        properties: {
          level3: level3Schema,
        },
      };

      const originalSchema: ObjectSchema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: level2Schema,
            },
          },
        },
        allOf: [
          {
            type: 'object',
            properties: {
              level1: {
                type: 'object',
                properties: {
                  level2: {
                    type: 'object',
                    properties: {
                      newProp: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        ],
      };

      const originalLevel2Ref = level2Schema;
      const originalLevel3Ref = level3Schema;

      const result = processAllOfSchema(originalSchema) as ObjectSchema;

      // Level 1 (properties.level1)는 복사되어 allOf가 추가됨
      expect(result.properties!.level1).not.toBe(
        originalSchema.properties!.level1,
      );
      expect(result.properties!.level1).toHaveProperty('allOf');

      // Level 2부터는 참조 공유되므로 원본 보호에 한계가 있을 수 있음
      const resultLevel2 = (result.properties!.level1 as any).properties.level2;
      expect(resultLevel2).toBe(originalLevel2Ref); // Level 2부터는 참조 공유

      // Level 3도 참조 공유 허용
      const resultLevel3 = resultLevel2.properties.level3;
      expect(resultLevel3).toBe(originalLevel3Ref);
    });

    test('다중 allOf 항목에서 원본 보호', () => {
      const propertySchema = { type: 'string' as const };

      const originalSchema: ObjectSchema = {
        type: 'object',
        properties: {
          target: propertySchema,
        },
        allOf: [
          {
            properties: {
              target: { minLength: 1 },
            },
          },
          {
            properties: {
              target: { maxLength: 50 },
            },
          },
          {
            properties: {
              target: { pattern: '^[a-zA-Z]+$' },
            },
          },
        ],
      };

      const originalPropertyRef = propertySchema;

      const result = processAllOfSchema(originalSchema) as ObjectSchema;

      // 결과에는 모든 allOf가 병합됨
      expect(result.properties!.target).toEqual({
        type: 'string',
        allOf: [
          { minLength: 1 },
          { maxLength: 50 },
          { pattern: '^[a-zA-Z]+$' },
        ],
      });

      // 원본은 변경되지 않음
      expect(originalPropertyRef).toEqual({ type: 'string' });
      expect(originalPropertyRef).not.toHaveProperty('allOf');
    });
  });

  describe('성능 최적화 검증', () => {
    test('대규모 Object Schema의 효율적 복사', () => {
      const properties: Record<string, any> = {};

      // 100개 프로퍼티 생성
      for (let i = 0; i < 100; i++) {
        properties[`prop${i}`] = {
          type: 'string',
          minLength: 1,
          nested: {
            deep: {
              veryDeep: `value${i}`,
            },
          },
        };
      }

      const originalSchema: ObjectSchema = {
        type: 'object',
        properties,
        allOf: [
          {
            properties: {
              prop0: {
                maxLength: 50,
              },
            },
          },
        ],
      };

      // 원본의 첫 번째 프로퍼티 참조
      const originalProp0 = originalSchema.properties!.prop0;
      const originalNestedRef = originalProp0.nested;

      const start = performance.now();
      const result = processAllOfSchema(originalSchema) as ObjectSchema;
      const end = performance.now();

      // 성능: 5ms 미만이어야 함 (전체 deep copy 대비 크게 빨라야 함)
      expect(end - start).toBeLessThan(5);

      // prop0는 수정되었으므로 복사됨
      expect(result.properties!.prop0).not.toBe(originalProp0);
      expect(result.properties!.prop0.nested).toBe(originalNestedRef); // 깊은 중첩은 참조 공유

      // prop1은 수정되지 않았지만 maxDepth=3이므로 복사됨
      expect(result.properties!.prop1).not.toBe(
        originalSchema.properties!.prop1,
      );

      // 원본 prop0는 변경되지 않음
      expect(originalProp0).not.toHaveProperty('allOf');
    });
  });
});
