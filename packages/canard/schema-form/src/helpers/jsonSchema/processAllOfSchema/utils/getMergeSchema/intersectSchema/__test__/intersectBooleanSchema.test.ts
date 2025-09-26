import { describe, expect, test } from 'vitest';

import type { BooleanSchema } from '@/schema-form/types';

import { intersectBooleanSchema } from '../intersectBooleanSchema';

describe('intersectBooleanSchema', () => {
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
        const baseValue = field === 'default' ? true : `base-${field}`;
        const sourceValue = field === 'default' ? false : `source-${field}`;

        const base: BooleanSchema = {
          type: 'boolean',
          [field]: baseValue,
        } as any;
        const source: Partial<BooleanSchema> = { [field]: sourceValue } as any;

        const result = intersectBooleanSchema(base, source);

        expect(result[field]).toBe(baseValue);
      });

      test.each(firstWinFields)(
        '%s 필드가 base에 없으면 source 값 사용',
        (field) => {
          const sourceValue = field === 'default' ? false : `source-${field}`;

          const base: BooleanSchema = { type: 'boolean' };
          const source: Partial<BooleanSchema> = {
            [field]: sourceValue,
          } as any;

          const result = intersectBooleanSchema(base, source);

          expect(result[field]).toBe(sourceValue);
        },
      );
    });

    describe('덮어쓰기 필드들', () => {
      test('커스텀 필드는 source 값으로 덮어쓰기', () => {
        const base: BooleanSchema = {
          type: 'boolean',
          customField1: 'base-value1',
          customField2: 'base-value2',
        } as any;
        const source: Partial<BooleanSchema> = {
          customField1: 'source-value1',
          customField3: 'source-value3',
        } as any;

        const result = intersectBooleanSchema(base, source);

        expect((result as any).customField1).toBe('source-value1'); // 덮어쓰기
        expect((result as any).customField2).toBe('base-value2'); // 유지
        expect((result as any).customField3).toBe('source-value3'); // 추가
      });
    });

    describe('Enum 교집합', () => {
      test('공통 값만 남김', () => {
        const base: BooleanSchema = { type: 'boolean', enum: [true, false] };
        const source: Partial<BooleanSchema> = { enum: [false] };

        const result = intersectBooleanSchema(base, source);

        expect(result.enum).toEqual([false]);
      });

      test('교집합이 빈 배열이면 에러', () => {
        const base: BooleanSchema = { type: 'boolean', enum: [true] };
        const source: Partial<BooleanSchema> = { enum: [false] };

        expect(() => intersectBooleanSchema(base, source)).toThrow(
          'Enum values must have at least one common value',
        );
      });
    });

    describe('Const 처리', () => {
      test('같은 const 값이면 유지', () => {
        const base: BooleanSchema = { type: 'boolean', const: true };
        const source: Partial<BooleanSchema> = { const: true };

        const result = intersectBooleanSchema(base, source);

        expect(result.const).toBe(true);
      });

      test('다른 const 값이면 에러', () => {
        const base: BooleanSchema = { type: 'boolean', const: true };
        const source: Partial<BooleanSchema> = { const: false };

        expect(() => intersectBooleanSchema(base, source)).toThrow(
          'Conflicting const values: true vs false',
        );
      });
    });

    describe('Required 합집합', () => {
      test('모든 required 배열 합치고 중복 제거', () => {
        const base: BooleanSchema = { type: 'boolean', required: ['a', 'b'] };
        const source: Partial<BooleanSchema> = { required: ['b', 'c'] };

        const result = intersectBooleanSchema(base, source);

        expect(result.required).toEqual(['a', 'b', 'c']);
      });
    });
  });

  describe('단순 병합 시나리오', () => {
    test('Boolean 타입은 추가 제약 조건이 없어 단순 병합', () => {
      const base: BooleanSchema = {
        type: 'boolean',
        title: 'Base Title',
        default: true,
      };

      const source: Partial<BooleanSchema> = {
        title: 'Source Title', // 무시됨 (First-Win)
        description: 'Source Description',
      };

      const result = intersectBooleanSchema(base, source);

      expect(result).toEqual({
        type: 'boolean',
        title: 'Base Title',
        default: true,
        description: 'Source Description',
      });
    });
  });
});
