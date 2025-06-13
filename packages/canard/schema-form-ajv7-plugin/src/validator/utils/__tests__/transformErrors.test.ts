import type { ErrorObject } from 'ajv';
import { describe, expect, it } from 'vitest';

import { transformErrors } from '../transformErrors';

describe('transformErrors', () => {
  describe('AJV7 dataPath JSONPointer 처리', () => {
    it('빈 문자열을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/required',
          keyword: 'type',
          params: {},
          message: 'must be string',
          dataPath: '',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/');
    });

    it('단순한 속성 경로를 변환해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/properties/name/type',
          keyword: 'type',
          params: {},
          message: 'should be string',
          dataPath: '/name',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
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
          dataPath: '/user/profile/name',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/user/profile/name');
    });

    it('배열 인덱스를 올바르게 변환해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/items/properties/name/type',
          keyword: 'type',
          params: {},
          message: 'should be string',
          dataPath: '/0/name',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/0/name');
    });

    it('다중 배열 인덱스를 올바르게 변환해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/items/items/type',
          keyword: 'type',
          params: {},
          message: 'should be number',
          dataPath: '/1/2',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/1/2');
    });

    it('복잡한 중첩 구조를 올바르게 변환해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath:
            '#/properties/data/properties/items/items/properties/metadata/properties/tags/items/type',
          keyword: 'type',
          params: {},
          message: 'should be string',
          dataPath: '/data/items/0/metadata/tags/1',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/data/items/0/metadata/tags/1');
    });

    it('큰 배열 인덱스를 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/items/type',
          keyword: 'type',
          params: {},
          message: 'should be string',
          dataPath: '/999',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/999');
    });
  });

  describe('required 키워드 에러 처리', () => {
    it('루트 레벨에서 required 속성을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/required',
          keyword: 'required',
          params: { missingProperty: 'name' },
          message: "should have required property 'name'",
          dataPath: '',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/name');
    });

    it('중첩된 객체에서 required 속성을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/properties/user/required',
          keyword: 'required',
          params: { missingProperty: 'email' },
          message: "should have required property 'email'",
          dataPath: '/user',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/user/email');
    });

    it('배열 요소에서 required 속성을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/items/required',
          keyword: 'required',
          params: { missingProperty: 'id' },
          message: "should have required property 'id'",
          dataPath: '/0',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/0/id');
    });

    it('복잡한 중첩 구조에서 required 속성을 올바르게 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath:
            '#/properties/data/properties/items/items/properties/metadata/required',
          keyword: 'required',
          params: { missingProperty: 'version' },
          message: "should have required property 'version'",
          dataPath: '/data/items/0/metadata',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
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
          dataPath: '/age',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
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
          dataPath: '/email',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
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
          dataPath: '/score',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
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
          message: "should have required property 'name'",
          dataPath: '',
        } as ErrorObject,
        {
          schemaPath: '#/properties/age/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'should be number',
          dataPath: '/age',
        } as ErrorObject,
        {
          schemaPath: '#/items/required',
          keyword: 'required',
          params: { missingProperty: 'id' },
          message: "should have required property 'id'",
          dataPath: '/0',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);

      expect(result).toHaveLength(3);
      expect(result[0].dataPath).toBe('/name');
      expect(result[1].dataPath).toBe('/age');
      expect(result[2].dataPath).toBe('/0/id');
    });
  });

  describe('엣지 케이스', () => {
    it('빈 배열을 처리해야 한다', () => {
      const errors: ErrorObject[] = [];
      const result = transformErrors(errors);
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
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/');
    });

    it('params가 없는 required 에러를 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/required',
          keyword: 'required',
          params: {},
          message: 'should have required property',
          dataPath: '/user',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/user');
    });

    it('missingProperty가 없는 required 에러를 처리해야 한다', () => {
      const errors: ErrorObject[] = [
        {
          schemaPath: '#/required',
          keyword: 'required',
          params: { otherParam: 'value' },
          message: 'should have required property',
          dataPath: '/user',
        } as ErrorObject,
      ];

      const result = transformErrors(errors);
      expect(result[0].dataPath).toBe('/user');
    });
  });

  describe('성능 테스트', () => {
    it('대량의 에러를 효율적으로 처리해야 한다', () => {
      const errors: ErrorObject[] = Array.from(
        { length: 1000 },
        (_, i) =>
          ({
            schemaPath: `#/items/properties/field${i}/type`,
            keyword: 'type',
            params: { type: 'string' },
            message: 'should be string',
            dataPath: `/${i}/field${i}`,
          }) as ErrorObject,
      );

      const startTime = performance.now();
      const result = transformErrors(errors);
      const endTime = performance.now();

      expect(result).toHaveLength(1000);
      expect(result[0].dataPath).toBe('/0/field0');
      expect(result[999].dataPath).toBe('/999/field999');

      // 성능 확인 (1000개 에러 처리가 10ms 이내에 완료되어야 함)
      expect(endTime - startTime).toBeLessThan(10);
    });
  });
});
