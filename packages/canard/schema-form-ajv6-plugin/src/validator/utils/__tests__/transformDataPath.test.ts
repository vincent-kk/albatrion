import type { ErrorObject } from 'ajv';
import { describe, expect, it } from 'vitest';

import { transformDataPath } from '../transformDataPath';

describe('transformDataPath', () => {
  describe('AJV dataPath to JSONPointer 변환', () => {
    it('빈 문자열을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/required',
          keyword: 'type',
          params: {},
          message: 'should be string',
          dataPath: '',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/');
    });

    it('단순한 속성 경로를 변환해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/properties/name/type',
          keyword: 'type',
          params: {},
          message: 'should be string',
          dataPath: 'name',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/name');
    });

    it('중첩된 속성 경로를 변환해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath:
            '#/properties/user/properties/profile/properties/name/type',
          keyword: 'type',
          params: {},
          message: 'should be string',
          dataPath: 'user.profile.name',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/user/profile/name');
    });

    it('배열 인덱스를 올바르게 변환해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/properties/users/items/properties/name/type',
          keyword: 'type',
          params: {},
          message: 'should be string',
          dataPath: 'users[0].name',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/users/0/name');
    });

    it('다중 배열 인덱스를 올바르게 변환해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/properties/matrix/items/items/type',
          keyword: 'type',
          params: {},
          message: 'should be number',
          dataPath: 'matrix[1][2]',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/matrix/1/2');
    });

    it('복잡한 중첩 구조를 올바르게 변환해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath:
            '#/properties/data/properties/items/items/properties/metadata/properties/tags/items/type',
          keyword: 'type',
          params: {},
          message: 'should be string',
          dataPath: 'data.items[0].metadata.tags[1]',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/data/items/0/metadata/tags/1');
    });

    it('큰 배열 인덱스를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/properties/items/items/type',
          keyword: 'type',
          params: {},
          message: 'should be string',
          dataPath: 'items[999]',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/items/999');
    });
  });

  describe('required 키워드 에러 처리', () => {
    it('루트 레벨에서 required 속성을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/required',
          keyword: 'required',
          params: { missingProperty: 'name' },
          message: "must have required property 'name'",
          dataPath: '',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/name');
    });

    it('중첩된 객체에서 required 속성을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/properties/user/required',
          keyword: 'required',
          params: { missingProperty: 'email' },
          message: "must have required property 'email'",
          dataPath: 'user',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/user/email');
    });

    it('배열 요소에서 required 속성을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/properties/users/items/required',
          keyword: 'required',
          params: { missingProperty: 'id' },
          message: "must have required property 'id'",
          dataPath: 'users[0]',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/users/0/id');
    });

    it('복잡한 중첩 구조에서 required 속성을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath:
            '#/properties/data/properties/items/items/properties/metadata/required',
          keyword: 'required',
          params: { missingProperty: 'version' },
          message: "must have required property 'version'",
          dataPath: 'data.items[0].metadata',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/data/items/0/metadata/version');
    });
  });

  describe('다양한 에러 타입 처리', () => {
    it('type 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/properties/age/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'should be number',
          dataPath: 'age',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0]).toEqual({
        dataPath: '/age',
        keyword: 'type',
        message: 'should be number',
        details: { type: 'number' },
        source: errors[0],
      });
    });

    it('format 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/properties/email/format',
          keyword: 'format',
          params: { format: 'email' },
          message: 'should match format "email"',
          dataPath: 'email',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0]).toEqual({
        dataPath: '/email',
        keyword: 'format',
        message: 'should match format "email"',
        details: { format: 'email' },
        source: errors[0],
      });
    });

    it('minimum 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/properties/score/minimum',
          keyword: 'minimum',
          params: { limit: 0 },
          message: 'should be >= 0',
          dataPath: 'score',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0]).toEqual({
        dataPath: '/score',
        keyword: 'minimum',
        message: 'should be >= 0',
        details: { limit: 0 },
        source: errors[0],
      });
    });
  });

  describe('다중 에러 처리', () => {
    it('여러 에러를 동시에 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/required',
          keyword: 'required',
          params: { missingProperty: 'name' },
          message: "must have required property 'name'",
          dataPath: '',
        },
        {
          schemaPath: '#/properties/age/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'should be number',
          dataPath: 'age',
        },
        {
          schemaPath: '#/properties/users/items/required',
          keyword: 'required',
          params: { missingProperty: 'id' },
          message: "must have required property 'id'",
          dataPath: 'users[0]',
        },
      ];

      const result = transformDataPath(errors);

      expect(result).toHaveLength(3);
      expect(result[0].dataPath).toBe('/name');
      expect(result[1].dataPath).toBe('/age');
      expect(result[2].dataPath).toBe('/users/0/id');
    });
  });

  describe('엣지 케이스', () => {
    it('빈 배열을 처리해야 한다', () => {
      const errors: ErrorObject[] = [];
      const result = transformDataPath(errors);
      expect(result).toEqual([]);
    });

    it('dataPath가 undefined인 경우를 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/type',
          keyword: 'type',
          params: {},
          message: 'should be object',
          dataPath: undefined as any,
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/');
    });

    it('params가 없는 required 에러를 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/required',
          keyword: 'required',
          params: {},
          message: 'must have required property',
          dataPath: 'user',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/user');
    });

    it('missingProperty가 없는 required 에러를 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/required',
          keyword: 'required',
          params: { otherParam: 'value' },
          message: 'must have required property',
          dataPath: 'user',
        },
      ];

      const result = transformDataPath(errors);
      expect(result[0].dataPath).toBe('/user');
    });
  });

  describe('성능 테스트', () => {
    it('대량의 에러를 효율적으로 처리해야 한다', () => {
      const errors: ErrorObject[] = Array.from({ length: 1000 }, (_, i) => ({
        schemaPath: `#/properties/items/items/properties/field${i}/type`,
        keyword: 'type',
        params: { type: 'string' },
        message: 'should be string',
        dataPath: `items[${i}].field${i}`,
      }));

      const startTime = performance.now();
      const result = transformDataPath(errors);
      const endTime = performance.now();

      expect(result).toHaveLength(1000);
      expect(result[0].dataPath).toBe('/items/0/field0');
      expect(result[999].dataPath).toBe('/items/999/field999');

      // 성능 확인 (1000개 에러 처리가 10ms 이내에 완료되어야 함)
      expect(endTime - startTime).toBeLessThan(10);
    });
  });
});
