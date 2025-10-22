import { describe, expect, it } from 'vitest';

import type { ObjectSchema } from '@/schema-form/types';

import { getObjectDefaultValue } from '../getObjectDefaultValue';

describe('getObjectDefaultValue', () => {
  it('스키마에 기본값이 없으면 빈 객체를 반환해야 합니다.', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    };
    expect(getObjectDefaultValue(schema)).toBeUndefined();
  });

  it('최상위 레벨 기본값을 반환해야 합니다.', () => {
    const schema: ObjectSchema = {
      type: 'object',
      default: { message: 'hello' },
      properties: {
        message: { type: 'string' },
      },
    };
    expect(getObjectDefaultValue(schema)).toEqual({ message: 'hello' });
  });

  it('중첩된 기본값을 반환해야 합니다.', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'Vincent' },
            isAdmin: { type: 'boolean', default: false },
          },
        },
        count: { type: 'number', default: 0 },
      },
    };
    expect(getObjectDefaultValue(schema)).toEqual({
      user: { name: 'Vincent', isAdmin: false },
      count: 0,
    });
  });

  it('inputDefault가 제공되면 해당 값을 우선해야 합니다.', () => {
    const schema: ObjectSchema = {
      type: 'object',
      default: { message: 'schema default' },
      properties: {
        message: { type: 'string' },
      },
    };
    const inputDefault = { message: 'input default' };
    expect(getObjectDefaultValue(schema, inputDefault)).toEqual({
      message: 'input default',
    });
  });

  it('inputDefault와 중첩된 기본값을 병합해야 합니다.', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'Vincent' },
            email: { type: 'string', default: 'vincent@example.com' },
          },
        },
        settings: {
          type: 'object',
          properties: {
            theme: { type: 'string', default: 'dark' },
          },
        },
      },
    };
    const inputDefault = {
      user: { name: 'Kelvin' }, // name은 inputDefault 값으로 덮어쓰여야 함
      // settings.theme는 스키마 기본값을 사용해야 함
    };
    expect(getObjectDefaultValue(schema, inputDefault)).toEqual({
      user: { name: 'Kelvin', email: 'vincent@example.com' },
      settings: { theme: 'dark' },
    });
  });

  it('inputDefault에 없는 경로의 스키마 기본값을 사용해야 합니다.', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'a-default' },
        b: {
          type: 'object',
          properties: {
            c: { type: 'number', default: 123 },
          },
        },
      },
    };
    const inputDefault = { b: {} }; // b는 제공되었지만 b.c는 제공되지 않음
    expect(getObjectDefaultValue(schema, inputDefault)).toEqual({
      a: 'a-default',
      b: { c: 123 },
    });
  });

  it('inputDefault가 스키마의 최상위 default보다 우선되어야 합니다.', () => {
    const schema: ObjectSchema = {
      type: 'object',
      default: { a: 'schema-top-default', b: 'schema-top-default-b' },
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
        c: { type: 'string', default: 'c-prop-default' },
      },
    };
    const inputDefault = { a: 'input-default-a' };
    expect(getObjectDefaultValue(schema, inputDefault)).toEqual({
      a: 'input-default-a',
      c: 'c-prop-default',
    });
  });

  describe('null 및 undefined 처리', () => {
    it('inputDefault가 null일 때 하위 노드에 default가 없으면 null을 반환해야 함', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      };
      // 현재 구현: null이 빈 객체 {}로 변환됨
      // 예상 동작: null을 유지해야 함
      const result = getObjectDefaultValue(schema, null);
      expect(result).toBeNull();
    });

    it('inputDefault가 undefined일 때 하위 노드에 default가 없으면 빈 객체를 반환해야 함', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      };
      const result = getObjectDefaultValue(schema, undefined);
      expect(result).toBeUndefined();
    });

    it('inputDefault가 null이지만 하위 노드에 default가 있으면 적절한 객체를 반환해야 함', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'Vincent' },
          age: { type: 'number', default: 30 },
        },
      };
      // null이 명시적으로 주어졌지만 하위 노드에 기본값이 있으므로
      // 하위 기본값으로 채워진 객체를 반환해야 함
      const result = getObjectDefaultValue(schema, null);
      expect(result).toEqual({
        name: 'Vincent',
        age: 30,
      });
    });

    it('schema.default가 null일 때 하위 노드에 default가 없으면 null을 반환해야 함', () => {
      const schema: ObjectSchema = {
        type: 'object',
        nullable: true,
        default: null,
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      };
      // 현재 구현: null이 빈 객체 {}로 변환됨
      // 예상 동작: null을 유지해야 함
      const result = getObjectDefaultValue(schema);
      expect(result).toBeNull();
    });

    it('schema.default가 null이지만 하위 노드에 default가 있으면 적절한 객체를 반환해야 함', () => {
      const schema: ObjectSchema = {
        type: 'object',
        nullable: true,
        default: null,
        properties: {
          name: { type: 'string', default: 'Vincent' },
          settings: {
            type: 'object',
            properties: {
              theme: { type: 'string', default: 'dark' },
            },
          },
        },
      };
      // 스키마의 default가 null이지만 하위 노드에 기본값이 있으므로
      // 하위 기본값으로 채워진 객체를 반환해야 함
      const result = getObjectDefaultValue(schema);
      expect(result).toEqual({
        name: 'Vincent',
        settings: { theme: 'dark' },
      });
    });

    it('중첩된 객체에서 일부가 null default를 가질 때 올바르게 처리해야 함', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            nullable: true,
            default: null,
            properties: {
              name: { type: 'string', default: 'Vincent' },
              age: { type: 'number', default: 30 },
            },
          },
          metadata: {
            type: 'object',
            nullable: true,
            default: null,
            properties: {
              created: { type: 'string' },
              updated: { type: 'string' },
            },
          },
        },
      };
      const result = getObjectDefaultValue(schema);
      // user는 하위에 default가 있으므로 객체로
      // metadata는 하위에 default가 없으므로 null로
      expect(result).toEqual({
        user: { name: 'Vincent', age: 30 },
        metadata: null,
      });
    });

    it('inputDefault가 명시적 null이고 schema.default가 객체일 때 null을 우선해야 함', () => {
      const schema: ObjectSchema = {
        type: 'object',
        default: { name: 'schema-default' },
        properties: {
          name: { type: 'string' },
        },
      };
      // inputDefault로 명시적 null이 전달되면 null을 우선
      const result = getObjectDefaultValue(schema, null);
      expect(result).toBeNull();
    });

    it('빈 객체 {}가 inputDefault로 주어졌을 때 하위 default를 적용해야 함', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'Vincent' },
          age: { type: 'number', default: 30 },
        },
      };
      // 빈 객체가 명시적으로 주어졌으므로 하위 기본값을 적용
      const result = getObjectDefaultValue(schema, {});
      expect(result).toEqual({
        name: 'Vincent',
        age: 30,
      });
    });
  });
});
