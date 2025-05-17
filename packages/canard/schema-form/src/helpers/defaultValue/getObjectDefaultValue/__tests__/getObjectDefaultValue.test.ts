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
    expect(getObjectDefaultValue(schema)).toEqual({});
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
});
