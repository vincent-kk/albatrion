import type { ErrorObject } from 'ajv/dist/2020';
import { beforeEach, describe, expect, it } from 'vitest';

import { transformErrors } from '../transformErrors';

describe('transformErrors', () => {
  let errors: ErrorObject[];

  beforeEach(() => {
    errors = [
      {
        keyword: 'required',
        instancePath: '',
        schemaPath: '#/required',
        params: { missingProperty: 'name' },
        message: "should have required property 'name'",
      },
      {
        keyword: 'type',
        instancePath: '/age/1/koreanAge',
        schemaPath: '#/properties/age/type',
        params: { type: 'number' },
        message: 'should be number',
      },
      {
        keyword: 'minimum',
        instancePath: '/age',
        schemaPath: '#/properties/age/minimum',
        params: { comparison: '>=', limit: 0 },
        message: 'should be >= 0',
      },
      {
        keyword: 'format',
        instancePath: '/email',
        schemaPath: '#/properties/email/format',
        params: { format: 'email' },
        message: 'should match format "email"',
      },
    ];
  });

  describe('기본 변환 기능', () => {
    it('should transform errors with missing property', () => {
      const result = transformErrors(errors);
      expect(result).toEqual([
        {
          keyword: 'required',
          dataPath: '/name',
          schemaPath: '#/required',
          message: "should have required property 'name'",
          details: { missingProperty: 'name' },
          source: errors[0],
        },
        {
          keyword: 'type',
          dataPath: '/age/1/koreanAge',
          schemaPath: '#/properties/age/type',
          message: 'should be number',
          details: { type: 'number' },
          source: errors[1],
        },
        {
          keyword: 'minimum',
          dataPath: '/age',
          schemaPath: '#/properties/age/minimum',
          message: 'should be >= 0',
          details: { comparison: '>=', limit: 0 },
          source: errors[2],
        },
        {
          keyword: 'format',
          dataPath: '/email',
          schemaPath: '#/properties/email/format',
          message: 'should match format "email"',
          details: { format: 'email' },
          source: errors[3],
        },
      ]);
    });

    it('should handle empty errors array', () => {
      const result = transformErrors([]);
      expect(result).toEqual([]);
    });

    it('should handle non-array input', () => {
      // @ts-expect-error ajv 에러 타입 확인
      const result = transformErrors(null);
      expect(result).toEqual([]);
    });
  });

  describe('JSONPointer instancePath 처리', () => {
    it('단순한 속성 경로를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'type',
          instancePath: '/name',
          schemaPath: '#/properties/name/type',
          params: { type: 'string' },
          message: 'should be string',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/name');
    });

    it('중첩된 속성 경로를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'type',
          instancePath: '/user/profile/name',
          schemaPath:
            '#/properties/user/properties/profile/properties/name/type',
          params: { type: 'string' },
          message: 'should be string',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/user/profile/name');
    });

    it('배열 인덱스 경로를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'type',
          instancePath: '/users/0/name',
          schemaPath: '#/properties/users/items/properties/name/type',
          params: { type: 'string' },
          message: 'should be string',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/users/0/name');
    });

    it('복잡한 중첩 배열 경로를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'type',
          instancePath: '/data/items/0/metadata/tags/1',
          schemaPath:
            '#/properties/data/properties/items/items/properties/metadata/properties/tags/items/type',
          params: { type: 'string' },
          message: 'should be string',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/data/items/0/metadata/tags/1');
    });
  });

  describe('required 키워드 에러 처리', () => {
    it('루트 레벨에서 required 속성을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'required',
          instancePath: '',
          schemaPath: '#/required',
          params: { missingProperty: 'email' },
          message: "must have required property 'email'",
        },
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/email');
    });

    it('중첩된 객체에서 required 속성을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'required',
          instancePath: '/user',
          schemaPath: '#/properties/user/required',
          params: { missingProperty: 'email' },
          message: "must have required property 'email'",
        },
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/user/email');
    });

    it('배열 요소에서 required 속성을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'required',
          instancePath: '/users/0',
          schemaPath: '#/properties/users/items/required',
          params: { missingProperty: 'id' },
          message: "must have required property 'id'",
        },
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/users/0/id');
    });

    it('깊은 중첩 구조에서 required 속성을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'required',
          instancePath: '/data/items/0/metadata',
          schemaPath:
            '#/properties/data/properties/items/items/properties/metadata/required',
          params: { missingProperty: 'version' },
          message: "must have required property 'version'",
        },
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/data/items/0/metadata/version');
    });
  });

  describe('다양한 에러 타입 처리', () => {
    it('type 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'type',
          instancePath: '/age',
          schemaPath: '#/properties/age/type',
          params: { type: 'number' },
          message: 'should be number',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0]).toEqual({
        dataPath: '/age',
        schemaPath: '#/properties/age/type',
        keyword: 'type',
        message: 'should be number',
        details: { type: 'number' },
        source: errors[0],
      });
    });

    it('format 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'format',
          instancePath: '/email',
          schemaPath: '#/properties/email/format',
          params: { format: 'email' },
          message: 'should match format "email"',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0]).toEqual({
        dataPath: '/email',
        schemaPath: '#/properties/email/format',
        keyword: 'format',
        message: 'should match format "email"',
        details: { format: 'email' },
        source: errors[0],
      });
    });

    it('minimum 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'minimum',
          instancePath: '/score',
          schemaPath: '#/properties/score/minimum',
          params: { limit: 0 },
          message: 'should be >= 0',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0]).toEqual({
        dataPath: '/score',
        schemaPath: '#/properties/score/minimum',
        keyword: 'minimum',
        message: 'should be >= 0',
        details: { limit: 0 },
        source: errors[0],
      });
    });

    it('maximum 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'maximum',
          instancePath: '/score',
          schemaPath: '#/properties/score/maximum',
          params: { limit: 100 },
          message: 'should be <= 100',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0]).toEqual({
        dataPath: '/score',
        schemaPath: '#/properties/score/maximum',
        keyword: 'maximum',
        message: 'should be <= 100',
        details: { limit: 100 },
        source: errors[0],
      });
    });

    it('pattern 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'pattern',
          instancePath: '/phone',
          schemaPath: '#/properties/phone/pattern',
          params: { pattern: '^\\d{3}-\\d{4}-\\d{4}$' },
          message: 'should match pattern "^\\d{3}-\\d{4}-\\d{4}$"',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0]).toEqual({
        dataPath: '/phone',
        schemaPath: '#/properties/phone/pattern',
        keyword: 'pattern',
        message: 'should match pattern "^\\d{3}-\\d{4}-\\d{4}$"',
        details: { pattern: '^\\d{3}-\\d{4}-\\d{4}$' },
        source: errors[0],
      });
    });

    it('enum 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'enum',
          instancePath: '/status',
          schemaPath: '#/properties/status/enum',
          params: { allowedValues: ['active', 'inactive', 'pending'] },
          message: 'should be equal to one of the allowed values',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0]).toEqual({
        dataPath: '/status',
        schemaPath: '#/properties/status/enum',
        keyword: 'enum',
        message: 'should be equal to one of the allowed values',
        details: { allowedValues: ['active', 'inactive', 'pending'] },
        source: errors[0],
      });
    });
  });

  describe('배열 관련 에러 처리', () => {
    it('minItems 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'minItems',
          instancePath: '/tags',
          schemaPath: '#/properties/tags/minItems',
          params: { limit: 1 },
          message: 'should NOT have fewer than 1 items',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0]).toEqual({
        dataPath: '/tags',
        schemaPath: '#/properties/tags/minItems',
        keyword: 'minItems',
        message: 'should NOT have fewer than 1 items',
        details: { limit: 1 },
        source: errors[0],
      });
    });

    it('maxItems 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'maxItems',
          instancePath: '/tags',
          schemaPath: '#/properties/tags/maxItems',
          params: { limit: 10 },
          message: 'should NOT have more than 10 items',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0]).toEqual({
        dataPath: '/tags',
        schemaPath: '#/properties/tags/maxItems',
        keyword: 'maxItems',
        message: 'should NOT have more than 10 items',
        details: { limit: 10 },
        source: errors[0],
      });
    });

    it('uniqueItems 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'uniqueItems',
          instancePath: '/tags',
          schemaPath: '#/properties/tags/uniqueItems',
          params: { i: 1, j: 3 },
          message:
            'should NOT have duplicate items (items ## 1 and 3 are identical)',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0]).toEqual({
        dataPath: '/tags',
        schemaPath: '#/properties/tags/uniqueItems',
        keyword: 'uniqueItems',
        message:
          'should NOT have duplicate items (items ## 1 and 3 are identical)',
        details: { i: 1, j: 3 },
        source: errors[0],
      });
    });
  });

  describe('문자열 관련 에러 처리', () => {
    it('minLength 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'minLength',
          instancePath: '/password',
          schemaPath: '#/properties/password/minLength',
          params: { limit: 8 },
          message: 'should NOT be shorter than 8 characters',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0]).toEqual({
        dataPath: '/password',
        schemaPath: '#/properties/password/minLength',
        keyword: 'minLength',
        message: 'should NOT be shorter than 8 characters',
        details: { limit: 8 },
        source: errors[0],
      });
    });

    it('maxLength 에러를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'maxLength',
          instancePath: '/description',
          schemaPath: '#/properties/description/maxLength',
          params: { limit: 500 },
          message: 'should NOT be longer than 500 characters',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0]).toEqual({
        dataPath: '/description',
        schemaPath: '#/properties/description/maxLength',
        keyword: 'maxLength',
        message: 'should NOT be longer than 500 characters',
        details: { limit: 500 },
        source: errors[0],
      });
    });
  });

  describe('다중 에러 처리', () => {
    it('여러 에러를 동시에 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'required',
          instancePath: '',
          schemaPath: '#/required',
          params: { missingProperty: 'name' },
          message: "must have required property 'name'",
        },
        {
          keyword: 'type',
          instancePath: '/age',
          schemaPath: '#/properties/age/type',
          params: { type: 'number' },
          message: 'should be number',
        },
        {
          keyword: 'required',
          instancePath: '/users/0',
          schemaPath: '#/properties/users/items/required',
          params: { missingProperty: 'id' },
          message: "must have required property 'id'",
        },
        {
          keyword: 'format',
          instancePath: '/email',
          schemaPath: '#/properties/email/format',
          params: { format: 'email' },
          message: 'should match format "email"',
        },
      ];

      const result = transformErrors(errors);

      expect(result).toHaveLength(4);
      expect(result[0].dataPath).toBe('/name');
      expect(result[1].dataPath).toBe('/age');
      expect(result[2].dataPath).toBe('/users/0/id');
      expect(result[3].dataPath).toBe('/email');
    });
  });

  describe('엣지 케이스', () => {
    it('instancePath가 undefined인 경우를 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'type',
          instancePath: undefined as any,
          schemaPath: '#/type',
          params: { type: 'object' },
          message: 'should be object',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/');
    });

    it('params가 없는 required 에러를 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'required',
          instancePath: '/user',
          schemaPath: '#/properties/user/required',
          params: {},
          message: 'must have required property',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/user');
    });

    it('missingProperty가 없는 required 에러를 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'required',
          instancePath: '/user',
          schemaPath: '#/properties/user/required',
          params: { otherParam: 'value' },
          message: 'must have required property',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/user');
    });

    it('message가 undefined인 경우를 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'type',
          instancePath: '/name',
          schemaPath: '#/properties/name/type',
          params: { type: 'string' },
          message: undefined as any,
        },
      ];

      const result = transformErrors(errors);
      expect(result[0].message).toBeUndefined();
    });

    it('params가 undefined인 경우를 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'custom',
          instancePath: '/data',
          schemaPath: '#/properties/data/custom',
          params: undefined as any,
          message: 'custom validation failed',
        },
      ];

      const result = transformErrors(errors);
      expect(result[0].details).toBeUndefined();
    });
  });

  describe('성능 테스트', () => {
    it('대량의 에러를 효율적으로 처리해야 한다', () => {
      const errors: ErrorObject[] = Array.from({ length: 1000 }, (_, i) => ({
        keyword: 'type',
        instancePath: `/items/${i}/field${i}`,
        schemaPath: `#/properties/items/items/properties/field${i}/type`,
        params: { type: 'string' },
        message: 'should be string',
      }));

      const startTime = performance.now();
      const result = transformErrors(errors);
      const endTime = performance.now();

      expect(result).toHaveLength(1000);
      expect(result[0].dataPath).toBe('/items/0/field0');
      expect(result[999].dataPath).toBe('/items/999/field999');

      // 성능 확인 (1000개 에러 처리가 10ms 이내에 완료되어야 함)
      expect(endTime - startTime).toBeLessThan(10);
    });

    it('복잡한 required 에러를 대량으로 처리해야 한다', () => {
      const errors: ErrorObject[] = Array.from({ length: 500 }, (_, i) => ({
        keyword: 'required',
        instancePath: `/data/items/${i}`,
        schemaPath: `#/properties/data/properties/items/items/required`,
        params: { missingProperty: `field${i}` },
        message: `must have required property 'field${i}'`,
      }));

      const startTime = performance.now();
      const result = transformErrors(errors);
      const endTime = performance.now();

      expect(result).toHaveLength(500);
      expect(result[0].dataPath).toBe('/data/items/0/field0');
      expect(result[499].dataPath).toBe('/data/items/499/field499');

      // 성능 확인 (500개 required 에러 처리가 10ms 이내에 완료되어야 함)
      expect(endTime - startTime).toBeLessThan(10);
    });
  });

  describe('실제 사용 시나리오', () => {
    it('사용자 등록 폼 검증 에러를 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'required',
          instancePath: '',
          schemaPath: '#/required',
          params: { missingProperty: 'email' },
          message: "must have required property 'email'",
        },
        {
          keyword: 'minLength',
          instancePath: '/password',
          schemaPath: '#/properties/password/minLength',
          params: { limit: 8 },
          message: 'should NOT be shorter than 8 characters',
        },
        {
          keyword: 'format',
          instancePath: '/email',
          schemaPath: '#/properties/email/format',
          params: { format: 'email' },
          message: 'should match format "email"',
        },
        {
          keyword: 'minimum',
          instancePath: '/age',
          schemaPath: '#/properties/age/minimum',
          params: { limit: 18 },
          message: 'should be >= 18',
        },
      ];

      const result = transformErrors(errors);

      expect(result).toHaveLength(4);
      expect(result[0].dataPath).toBe('/email');
      expect(result[1].dataPath).toBe('/password');
      expect(result[2].dataPath).toBe('/email');
      expect(result[3].dataPath).toBe('/age');
    });

    it('중첩된 객체 배열 검증 에러를 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'required',
          instancePath: '/users/0',
          schemaPath: '#/properties/users/items/required',
          params: { missingProperty: 'name' },
          message: "must have required property 'name'",
        },
        {
          keyword: 'type',
          instancePath: '/users/0/age',
          schemaPath: '#/properties/users/items/properties/age/type',
          params: { type: 'number' },
          message: 'should be number',
        },
        {
          keyword: 'required',
          instancePath: '/users/1/profile',
          schemaPath: '#/properties/users/items/properties/profile/required',
          params: { missingProperty: 'bio' },
          message: "must have required property 'bio'",
        },
      ];

      const result = transformErrors(errors);

      expect(result).toHaveLength(3);
      expect(result[0].dataPath).toBe('/users/0/name');
      expect(result[1].dataPath).toBe('/users/0/age');
      expect(result[2].dataPath).toBe('/users/1/profile/bio');
    });
  });
});
