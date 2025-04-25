import { describe, expect, it } from 'vitest';

import { findSchemaByPointer } from '../findSchemaByPointer';

describe('findSchemaByPointer 기본 테스트', () => {
  const testSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      age: { type: 'number', minimum: 0 },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
        },
      },
    },
    required: ['name', 'age'],
  };

  it('should return the entire schema for empty pointer', () => {
    expect(findSchemaByPointer(testSchema, '')).toBe(testSchema);
  });

  it('should return the entire schema for root pointer', () => {
    expect(findSchemaByPointer(testSchema, '#')).toBe(testSchema);
  });

  it('should handle simple property access', () => {
    expect(findSchemaByPointer(testSchema, '/type')).toBe('object');
  });

  it('should handle nested property access', () => {
    expect(findSchemaByPointer(testSchema, '/properties/name')).toEqual({
      type: 'string',
      minLength: 1,
    });
  });

  it('should handle deeply nested property access', () => {
    expect(
      findSchemaByPointer(testSchema, '/properties/address/properties/street'),
    ).toEqual({
      type: 'string',
    });
  });

  it('should handle array-like access', () => {
    expect(findSchemaByPointer(testSchema, '/required/0')).toBe('name');
  });

  it('should handle pointer with # prefix', () => {
    expect(findSchemaByPointer(testSchema, '#/properties/age')).toEqual({
      type: 'number',
      minimum: 0,
    });
  });

  it('should handle escaped characters in pointer', () => {
    const schemaWithSpecialChars = {
      'special/key': { type: 'string' },
      'special~key': { type: 'number' },
    };

    expect(
      findSchemaByPointer(schemaWithSpecialChars, '/special~1key'),
    ).toEqual({
      type: 'string',
    });
    expect(
      findSchemaByPointer(schemaWithSpecialChars, '/special~0key'),
    ).toEqual({
      type: 'number',
    });
  });

  it('should return undefined for non-existent paths', () => {
    expect(findSchemaByPointer(testSchema, '/nonexistent')).toBeUndefined();
    expect(
      findSchemaByPointer(testSchema, '/properties/nonexistent'),
    ).toBeUndefined();
    expect(
      findSchemaByPointer(testSchema, '/properties/name/nonexistent'),
    ).toBeUndefined();
  });

  it('should handle complex nested structures', () => {
    const complexSchema = {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              details: {
                $ref: '#/definitions/userDetails',
              },
            },
          },
        },
      },
      definitions: {
        userDetails: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            age: { type: 'number' },
          },
        },
      },
    };

    expect(
      findSchemaByPointer(
        complexSchema,
        '/properties/users/items/properties/details',
      ),
    ).toEqual({
      $ref: '#/definitions/userDetails',
    });

    expect(
      findSchemaByPointer(
        complexSchema,
        '/definitions/userDetails/properties/email',
      ),
    ).toEqual({
      type: 'string',
      format: 'email',
    });
  });
});

describe('findSchemaByPointer 추가 테스트', () => {
  const testSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      'special~field': { type: 'number' },
      'slash/field': { type: 'boolean' },
      'tilde~slash/field': { type: 'array' },
      empty: '',
      nested: {
        deep: {
          property: {
            value: 42,
          },
        },
      },
      array: [
        { id: 1 },
        { id: 2 },
        {
          'complex~key/here': {
            type: 'string',
            'even/more~complex': true,
          },
        },
      ],
    },
    required: ['name'],
  };

  // 기본 경로 테스트
  it('기본 경로로 스키마를 찾을 수 있어야 합니다', () => {
    expect(findSchemaByPointer(testSchema, '/properties/name')).toEqual({
      type: 'string',
    });
  });

  // 빈 포인터 테스트
  it('빈 포인터는 전체 스키마를 반환해야 합니다', () => {
    expect(findSchemaByPointer(testSchema, '')).toBe(testSchema);
    expect(findSchemaByPointer(testSchema, '/')).toBe(testSchema);
    expect(findSchemaByPointer(testSchema, '#')).toBe(testSchema);
    expect(findSchemaByPointer(testSchema, '#/')).toBe(testSchema);
  });

  // 이스케이프 문자 테스트
  describe('이스케이프 문자 처리', () => {
    it('틸드(~) 이스케이프를 처리해야 합니다', () => {
      expect(
        findSchemaByPointer(testSchema, '/properties/special~0field'),
      ).toEqual({
        type: 'number',
      });
    });

    it('슬래시(/) 이스케이프를 처리해야 합니다', () => {
      expect(
        findSchemaByPointer(testSchema, '/properties/slash~1field'),
      ).toEqual({
        type: 'boolean',
      });
    });

    it('틸드와 슬래시가 혼합된 경우를 처리해야 합니다', () => {
      expect(
        findSchemaByPointer(testSchema, '/properties/tilde~0slash~1field'),
      ).toEqual({
        type: 'array',
      });
    });
  });

  // 중첩된 경로 테스트
  describe('중첩된 경로', () => {
    it('깊이 중첩된 속성을 찾을 수 있어야 합니다', () => {
      expect(
        findSchemaByPointer(
          testSchema,
          '/properties/nested/deep/property/value',
        ),
      ).toBe(42);
    });

    it('배열 내 객체의 속성을 찾을 수 있어야 합니다', () => {
      expect(findSchemaByPointer(testSchema, '/properties/array/0/id')).toBe(1);
    });

    it('배열 내 복잡한 키를 가진 객체를 찾을 수 있어야 합니다', () => {
      expect(
        findSchemaByPointer(
          testSchema,
          '/properties/array/2/complex~0key~1here/even~1more~0complex',
        ),
      ).toBe(true);
    });
  });

  // 엣지케이스 테스트
  describe('엣지케이스', () => {
    it('존재하지 않는 경로는 undefined를 반환해야 합니다', () => {
      expect(findSchemaByPointer(testSchema, '/nonexistent')).toBeUndefined();
      expect(
        findSchemaByPointer(testSchema, '/properties/nonexistent'),
      ).toBeUndefined();
      expect(
        findSchemaByPointer(
          testSchema,
          '/properties/nested/nonexistent/property',
        ),
      ).toBeUndefined();
    });

    it('빈 문자열 값을 올바르게 처리해야 합니다', () => {
      expect(findSchemaByPointer(testSchema, '/properties/empty')).toBe('');
    });

    it('잘못된 이스케이프 시퀀스를 처리해야 합니다', () => {
      expect(
        findSchemaByPointer(testSchema, '/properties/name~'),
      ).toBeUndefined();
      expect(
        findSchemaByPointer(testSchema, '/properties/name~2'),
      ).toBeUndefined();
    });

    it('연속된 슬래시를 처리해야 합니다', () => {
      expect(
        findSchemaByPointer(testSchema, '/properties//name'),
      ).toBeUndefined();
    });

    it('배열 인덱스 범위를 검사해야 합니다', () => {
      expect(
        findSchemaByPointer(testSchema, '/properties/array/-1'),
      ).toBeUndefined();
      expect(
        findSchemaByPointer(testSchema, '/properties/array/999'),
      ).toBeUndefined();
    });
  });

  // 특수한 형식 테스트
  describe('특수한 포인터 형식', () => {
    it('URI 프래그먼트 식별자(#)로 시작하는 포인터를 처리해야 합니다', () => {
      expect(findSchemaByPointer(testSchema, '#/properties/name')).toEqual({
        type: 'string',
      });
    });

    it('중복된 슬래시로 시작하는 포인터를 처리해야 합니다', () => {
      expect(findSchemaByPointer(testSchema, '//properties/name')).toEqual({
        type: 'string',
      });
    });

    it('URL 인코딩된 문자를 포함하는 포인터를 처리해야 합니다', () => {
      const schemaWithEncoded = {
        properties: {
          '%25': { type: 'string' },
        },
      };
      expect(findSchemaByPointer(schemaWithEncoded, '/properties/%25')).toEqual(
        {
          type: 'string',
        },
      );
    });
  });

  // 성능 테스트
  describe('성능 테스트', () => {
    it('매우 긴 경로를 처리할 수 있어야 합니다', () => {
      const deepSchema = { a: { a: { a: { a: { a: { value: 'deep' } } } } } };
      const longPath = '/a/a/a/a/a/value';
      expect(findSchemaByPointer(deepSchema, longPath)).toBe('deep');
    });

    it('많은 이스케이프 문자가 있는 경로를 처리할 수 있어야 합니다', () => {
      const complexSchema = {
        properties: {
          'many~tildes~and~slashes/here/test': { value: 'found' },
        },
      };
      expect(
        findSchemaByPointer(
          complexSchema,
          '/properties/many~0tildes~0and~0slashes~1here~1test/value',
        ),
      ).toBe('found');
    });
  });
});
