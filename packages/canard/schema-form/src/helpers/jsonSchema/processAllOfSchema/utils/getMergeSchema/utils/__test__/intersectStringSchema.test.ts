import { describe, expect, test } from 'vitest';

import type { StringSchema } from '@/schema-form/types';

import { intersectStringSchema } from '../intersectSchema/intersectStringSchema';

describe('intersectStringSchema', () => {
  describe('Pattern 병합 (AND 결합)', () => {
    test('두 패턴을 AND로 결합', () => {
      const base: StringSchema = { type: 'string', pattern: '^[a-z]+$' };
      const source: Partial<StringSchema> = { pattern: '^.{5,}$' };

      const result = intersectStringSchema(base, source);

      expect(result.pattern).toBe('(?=^[a-z]+$)(?=^.{5,}$)');
    });

    test('세 개 이상의 패턴 결합', () => {
      const base: StringSchema = { type: 'string', pattern: '^[a-z]+$' };
      const source: Partial<StringSchema> = { pattern: '^.{5,}$' };

      const result1 = intersectStringSchema(base, source);
      const result2 = intersectStringSchema(result1, { pattern: '^.{0,10}$' });

      expect(result2.pattern).toBe('(?=(?=^[a-z]+$)(?=^.{5,}$))(?=^.{0,10}$)');
    });

    test('base에만 패턴이 있는 경우', () => {
      const base: StringSchema = { type: 'string', pattern: '^[a-z]+$' };
      const source: Partial<StringSchema> = {};

      const result = intersectStringSchema(base, source);

      expect(result.pattern).toBe('^[a-z]+$');
    });

    test('source에만 패턴이 있는 경우', () => {
      const base: StringSchema = { type: 'string' };
      const source: Partial<StringSchema> = { pattern: '^.{5,}$' };

      const result = intersectStringSchema(base, source);

      expect(result.pattern).toBe('^.{5,}$');
    });
  });

  describe('MinLength/MaxLength 병합 (가장 제한적인 값)', () => {
    test('minLength는 더 큰 값, maxLength는 더 작은 값 선택', () => {
      const base: StringSchema = {
        type: 'string',
        minLength: 3,
        maxLength: 10,
      };
      const source: Partial<StringSchema> = { minLength: 5, maxLength: 8 };

      const result = intersectStringSchema(base, source);

      expect(result.minLength).toBe(5); // Math.max(3, 5)
      expect(result.maxLength).toBe(8); // Math.min(10, 8)
    });

    test('base에만 제약이 있는 경우', () => {
      const base: StringSchema = { type: 'string', minLength: 3 };
      const source: Partial<StringSchema> = {};

      const result = intersectStringSchema(base, source);

      expect(result.minLength).toBe(3);
    });

    test('source에만 제약이 있는 경우', () => {
      const base: StringSchema = { type: 'string' };
      const source: Partial<StringSchema> = { maxLength: 10 };

      const result = intersectStringSchema(base, source);

      expect(result.maxLength).toBe(10);
    });

    test('범위 충돌 시 에러 발생', () => {
      const base: StringSchema = { type: 'string', minLength: 10 };
      const source: Partial<StringSchema> = { maxLength: 5 };

      expect(() => intersectStringSchema(base, source)).toThrow(
        'Invalid string constraints: minLength (10 > 5)',
      );
    });
  });

  describe('Format 필드 (First-Win)', () => {
    test('base에 format이 있으면 base 값 유지', () => {
      const base: StringSchema = { type: 'string', format: 'email' };
      const source: Partial<StringSchema> = { format: 'uri' };

      const result = intersectStringSchema(base, source);

      expect(result.format).toBe('email');
    });

    test('base에 format이 없으면 source 값 사용', () => {
      const base: StringSchema = { type: 'string' };
      const source: Partial<StringSchema> = { format: 'uri' };

      const result = intersectStringSchema(base, source);

      expect(result.format).toBe('uri');
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
        const baseValue = `base-${field}`;
        const sourceValue = `source-${field}`;

        const base: StringSchema = {
          type: 'string',
          [field]: baseValue,
        } as any;
        const source: Partial<StringSchema> = { [field]: sourceValue } as any;

        const result = intersectStringSchema(base, source);

        expect(result[field]).toBe(baseValue);
      });

      test.each(firstWinFields)(
        '%s 필드가 base에 없으면 source 값 사용',
        (field) => {
          const sourceValue = `source-${field}`;

          const base: StringSchema = { type: 'string' };
          const source: Partial<StringSchema> = { [field]: sourceValue } as any;

          const result = intersectStringSchema(base, source);

          expect(result[field]).toBe(sourceValue);
        },
      );
    });

    describe('덮어쓰기 필드들', () => {
      test('커스텀 필드는 source 값으로 덮어쓰기', () => {
        const base: StringSchema = {
          type: 'string',
          customField1: 'base-value1',
          customField2: 'base-value2',
        } as any;
        const source: Partial<StringSchema> = {
          customField1: 'source-value1',
          customField3: 'source-value3',
        } as any;

        const result = intersectStringSchema(base, source);

        expect((result as any).customField1).toBe('source-value1'); // 덮어쓰기
        expect((result as any).customField2).toBe('base-value2'); // 유지
        expect((result as any).customField3).toBe('source-value3'); // 추가
      });
    });

    describe('Enum 교집합', () => {
      test('공통 값만 남김', () => {
        const base: StringSchema = { type: 'string', enum: ['a', 'b', 'c'] };
        const source: Partial<StringSchema> = { enum: ['b', 'c', 'd'] };

        const result = intersectStringSchema(base, source);

        expect(result.enum).toEqual(['b', 'c']);
      });

      test('교집합이 빈 배열이면 에러', () => {
        const base: StringSchema = { type: 'string', enum: ['a', 'b'] };
        const source: Partial<StringSchema> = { enum: ['c', 'd'] };

        expect(() => intersectStringSchema(base, source)).toThrow(
          'Enum values must have at least one common value',
        );
      });

      test('base에만 enum이 있는 경우', () => {
        const base: StringSchema = { type: 'string', enum: ['a', 'b'] };
        const source: Partial<StringSchema> = {};

        const result = intersectStringSchema(base, source);

        expect(result.enum).toEqual(['a', 'b']);
      });
    });

    describe('Const 처리', () => {
      test('같은 const 값이면 유지', () => {
        const base: StringSchema = { type: 'string', const: 'value' };
        const source: Partial<StringSchema> = { const: 'value' };

        const result = intersectStringSchema(base, source);

        expect(result.const).toBe('value');
      });

      test('다른 const 값이면 에러', () => {
        const base: StringSchema = { type: 'string', const: 'value1' };
        const source: Partial<StringSchema> = { const: 'value2' };

        expect(() => intersectStringSchema(base, source)).toThrow(
          'Conflicting const values: value1 vs value2',
        );
      });
    });

    describe('Required 합집합', () => {
      test('모든 required 배열 합치고 중복 제거', () => {
        const base: StringSchema = { type: 'string', required: ['a', 'b'] };
        const source: Partial<StringSchema> = { required: ['b', 'c'] };

        const result = intersectStringSchema(base, source);

        expect(result.required).toEqual(['a', 'b', 'c']);
      });
    });
  });

  describe('복합 시나리오', () => {
    test('모든 제약이 함께 적용되는 경우', () => {
      const base: StringSchema = {
        type: 'string',
        title: 'Base Title',
        pattern: '^[a-z]+$',
        minLength: 3,
        maxLength: 10,
        format: 'email',
        enum: ['abc', 'def', 'ghi'],
      };

      const source: Partial<StringSchema> = {
        title: 'Source Title', // 무시됨 (First-Win)
        pattern: '^.{5,}$',
        minLength: 5,
        maxLength: 8,
        format: 'uri', // 무시됨 (First-Win)
        enum: ['def', 'ghi', 'jkl'],
      };

      const result = intersectStringSchema(base, source);

      expect(result).toEqual({
        type: 'string',
        title: 'Base Title',
        pattern: '(?=^[a-z]+$)(?=^.{5,}$)',
        minLength: 5,
        maxLength: 8,
        format: 'email',
        enum: ['def', 'ghi'],
      });
    });
  });
});
