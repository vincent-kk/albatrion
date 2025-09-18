import { describe, expect, it } from 'vitest';

import type { JsonSchemaError } from '@/schema-form/types';

import { transformErrors } from '../transformErrors';

// 테스트용 모킹 데이터
const createMockError = (
  keyword: string,
  message?: string,
): JsonSchemaError => ({
  keyword,
  dataPath: `test.${keyword}`,
  message: message || `Test error for ${keyword}`,
  details: {},
  source: { originalKeyword: keyword },
});

describe('transformErrors', () => {
  describe('기본 동작', () => {
    it('빈 배열을 반환해야 합니다 - 입력이 빈 배열인 경우', () => {
      // Arrange
      const errors: JsonSchemaError[] = [];

      // Act
      const result = transformErrors(errors);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('입력 에러들을 그대로 반환해야 합니다 - 필터링이나 키 추가 없이', () => {
      // Arrange
      const errors: JsonSchemaError[] = [
        createMockError('required'),
        createMockError('type'),
      ];

      // Act
      const result = transformErrors(errors);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].keyword).toBe('required');
      expect(result[1].keyword).toBe('type');
    });
  });

  describe('입력 검증', () => {
    it('빈 배열을 반환해야 합니다 - 입력이 null인 경우', () => {
      // Act
      const result = transformErrors(null as any);

      // Assert
      expect(result).toEqual([]);
    });

    it('빈 배열을 반환해야 합니다 - 입력이 undefined인 경우', () => {
      // Act
      const result = transformErrors(undefined as any);

      // Assert
      expect(result).toEqual([]);
    });

    it('빈 배열을 반환해야 합니다 - 입력이 배열이 아닌 경우', () => {
      // Act
      const result = transformErrors('not-an-array' as any);

      // Assert
      expect(result).toEqual([]);
    });

    it('빈 배열을 반환해야 합니다 - 입력이 객체인 경우', () => {
      // Act
      const result = transformErrors({ keyword: 'test' } as any);

      // Assert
      expect(result).toEqual([]);
    });
  });

  // omits 파라미터가 제거되어 이 테스트 섹션은 더 이상 필요하지 않습니다

  describe('key 파라미터 테스트', () => {
    it('각 에러에 순차적인 키를 추가해야 합니다 - key가 true인 경우', () => {
      // Arrange
      const errors: JsonSchemaError[] = [
        createMockError('required'),
        createMockError('type'),
        createMockError('pattern'),
      ];

      // Act
      const result = transformErrors(errors, true);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].key).toBeDefined();
      expect(result[1].key).toBeDefined();
      expect(result[2].key).toBeDefined();

      // 키가 순차적으로 증가하는지 확인
      expect(result[1].key).toBe(result[0].key! + 1);
      expect(result[2].key).toBe(result[1].key! + 1);
    });

    it('에러에 키를 추가하지 않아야 합니다 - key가 false인 경우', () => {
      // Arrange
      const errors: JsonSchemaError[] = [
        createMockError('required'),
        createMockError('type'),
      ];

      // Act
      const result = transformErrors(errors, false);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].key).toBeUndefined();
      expect(result[1].key).toBeUndefined();
    });

    it('에러에 키를 추가하지 않아야 합니다 - key가 undefined인 경우', () => {
      // Arrange
      const errors: JsonSchemaError[] = [
        createMockError('required'),
        createMockError('type'),
      ];

      // Act
      const result = transformErrors(errors, undefined);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].key).toBeUndefined();
      expect(result[1].key).toBeUndefined();
    });

    it('전역 시퀀스가 증가해야 합니다 - 여러 호출에서', () => {
      // Arrange
      const errors1: JsonSchemaError[] = [createMockError('required')];
      const errors2: JsonSchemaError[] = [createMockError('type')];

      // Act
      const result1 = transformErrors(errors1, true);
      const result2 = transformErrors(errors2, true);

      // Assert
      expect(result1[0].key).toBeDefined();
      expect(result2[0].key).toBeDefined();
      expect(result2[0].key).toBeGreaterThan(result1[0].key!);
    });
  });

  // omits 파라미터가 제거되어 복합 시나리오 테스트는 더 이상 필요하지 않습니다

  describe('원본 데이터 변경 (mutation) 테스트', () => {
    it('원본 에러 객체를 변경해야 합니다 - key 추가 시', () => {
      // Arrange
      const originalError = createMockError('required');
      const errors: JsonSchemaError[] = [originalError];

      // 원본에는 key가 없음을 확인
      expect(originalError.key).toBeUndefined();

      // Act
      const result = transformErrors(errors, true);

      // Assert
      // 원본 객체가 변경되었는지 확인
      expect(originalError.key).toBeDefined();
      expect(result[0]).toBe(originalError); // 같은 객체 참조인지 확인
      expect(result[0].key).toBe(originalError.key);
    });

    it('원본 에러 객체를 변경하지 않아야 합니다 - key 추가하지 않을 때', () => {
      // Arrange
      const originalError = createMockError('required');
      const errors: JsonSchemaError[] = [originalError];

      // 원본에는 key가 없음을 확인
      expect(originalError.key).toBeUndefined();

      // Act
      const result = transformErrors(errors, false);

      // Assert
      // 원본 객체의 key가 undefined로 설정되었는지 확인
      expect(originalError.key).toBeUndefined();
      expect(result[0]).toBe(originalError); // 같은 객체 참조인지 확인
    });
  });

  describe('성능 최적화 테스트', () => {
    it('대량의 에러를 효율적으로 처리해야 합니다', () => {
      // Arrange
      const largeErrorArray: JsonSchemaError[] = Array.from(
        { length: 1000 },
        (_, index) => createMockError(`error${index}`),
      );

      // Act
      const start = performance.now();
      const result = transformErrors(largeErrorArray, true);
      const end = performance.now();

      // Assert
      expect(result).toHaveLength(1000);
      expect(end - start).toBeLessThan(100); // 100ms 이하로 처리되어야 함

      // 모든 에러에 키가 할당되었는지 확인
      result.forEach((error, index) => {
        expect(error.key).toBeDefined();
        if (index > 0) {
          expect(error.key).toBeGreaterThan(result[index - 1].key!);
        }
      });
    });
  });

  describe('실제 사용 시나리오 테스트', () => {
    it('실제 JSON Schema 검증 에러를 처리해야 합니다', () => {
      // Arrange
      const realWorldErrors: JsonSchemaError[] = [
        {
          keyword: 'required',
          dataPath: 'root',
          message: "should have required property 'email'",
          details: { missingProperty: 'email' },
          source: { originalKeyword: 'required', missingProperty: 'email' },
        },
        {
          keyword: 'minLength',
          dataPath: 'username',
          message: 'should NOT be shorter than 5 characters',
          details: { limit: 5 },
          source: { originalKeyword: 'minLength', limit: 5 },
        },
        {
          keyword: 'pattern',
          dataPath: 'phoneNumber',
          message: 'should match pattern "^\\+?[1-9]\\d{1,14}$"',
          details: { pattern: '^\\+?[1-9]\\d{1,14}$' },
          source: {
            originalKeyword: 'pattern',
            pattern: '^\\+?[1-9]\\d{1,14}$',
          },
        },
      ];

      // Act
      const result = transformErrors(realWorldErrors, true);

      // Assert
      expect(result).toHaveLength(3);  // pattern 에러가 더 이상 필터링되지 않음
      expect(result[0].keyword).toBe('required');
      expect(result[1].keyword).toBe('minLength');
      expect(result[2].keyword).toBe('pattern');  // pattern 에러도 포함됨
      expect(result[0].key).toBeDefined();
      expect(result[1].key).toBeDefined();
      expect(result[2].key).toBeDefined();

      // 원본 데이터 구조가 보존되는지 확인
      expect(result[0].message).toBe("should have required property 'email'");
      expect(result[1].details).toEqual({ limit: 5 });
    });
  });
});
