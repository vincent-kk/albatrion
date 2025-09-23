import { describe, expect, test } from 'vitest';

import type { NullSchema } from '@/schema-form/types';

import { intersectNullSchema } from '../intersectSchema/intersectNullSchema';

describe('intersectNullSchema', () => {
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
        const baseValue = field === 'default' ? null : `base-${field}`;
        const sourceValue = field === 'default' ? null : `source-${field}`;

        const base: NullSchema = { type: 'null', [field]: baseValue } as any;
        const source: Partial<NullSchema> = { [field]: sourceValue } as any;

        const result = intersectNullSchema(base, source);

        expect(result[field]).toBe(baseValue);
      });

      test.each(firstWinFields)(
        '%s 필드가 base에 없으면 source 값 사용',
        (field) => {
          const sourceValue = field === 'default' ? null : `source-${field}`;

          const base: NullSchema = { type: 'null' };
          const source: Partial<NullSchema> = { [field]: sourceValue } as any;

          const result = intersectNullSchema(base, source);

          expect(result[field]).toBe(sourceValue);
        },
      );
    });

    describe('덮어쓰기 필드들', () => {
      test('커스텀 필드는 source 값으로 덮어쓰기', () => {
        const base: NullSchema = {
          type: 'null',
          customField1: 'base-value1',
          customField2: 'base-value2',
        } as any;
        const source: Partial<NullSchema> = {
          customField1: 'source-value1',
          customField3: 'source-value3',
        } as any;

        const result = intersectNullSchema(base, source);

        expect((result as any).customField1).toBe('source-value1'); // 덮어쓰기
        expect((result as any).customField2).toBe('base-value2'); // 유지
        expect((result as any).customField3).toBe('source-value3'); // 추가
      });
    });

    describe('Enum 교집합', () => {
      test('null 타입의 enum은 항상 [null]', () => {
        const base: NullSchema = { type: 'null', enum: [null] };
        const source: Partial<NullSchema> = { enum: [null] };

        const result = intersectNullSchema(base, source);

        expect(result.enum).toEqual([null]);
      });

      test('null이 아닌 enum 값이 있으면 에러', () => {
        const base: NullSchema = { type: 'null', enum: [null] };
        const source: Partial<NullSchema> = { enum: [] }; // 빈 교집합

        expect(() => intersectNullSchema(base, source)).toThrow(
          'Enum values must have at least one common value',
        );
      });
    });

    describe('Const 처리', () => {
      test('null const 값이면 유지', () => {
        const base: NullSchema = { type: 'null', const: null };
        const source: Partial<NullSchema> = { const: null };

        const result = intersectNullSchema(base, source);

        expect(result.const).toBe(null);
      });

      test('null이 아닌 const 값이면 에러', () => {
        const base: NullSchema = { type: 'null', const: null };
        const source: Partial<NullSchema> = { const: 'not-null' as any };

        expect(() => intersectNullSchema(base, source)).toThrow(
          'Conflicting const values: null vs not-null',
        );
      });
    });

    describe('Required 합집합', () => {
      test('모든 required 배열 합치고 중복 제거', () => {
        const base: NullSchema = { type: 'null', required: ['a', 'b'] };
        const source: Partial<NullSchema> = { required: ['b', 'c'] };

        const result = intersectNullSchema(base, source);

        expect(result.required).toEqual(['a', 'b', 'c']);
      });
    });
  });

  describe('단순 병합 시나리오', () => {
    test('Null 타입은 추가 제약 조건이 없어 단순 병합', () => {
      const base: NullSchema = {
        type: 'null',
        title: 'Base Title',
        default: null,
      };

      const source: Partial<NullSchema> = {
        title: 'Source Title', // 무시됨 (First-Win)
        description: 'Source Description',
      };

      const result = intersectNullSchema(base, source);

      expect(result).toEqual({
        type: 'null',
        title: 'Base Title',
        default: null,
        description: 'Source Description',
      });
    });
  });
});
