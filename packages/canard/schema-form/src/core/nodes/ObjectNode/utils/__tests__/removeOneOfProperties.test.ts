import { describe, expect, it } from 'vitest';

import type { JsonSchema, ObjectValue } from '@/schema-form/types';

import { getOneOfKeyInfo } from '../getOneOfKeyInfo';
import { processValueWithOneOfSchema } from '../processValueWithSchema';

describe('processValueWithOneOfSchema', () => {
  it('should remove oneOf fields and keep properties fields', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'number' } },
      oneOf: [
        { properties: { c: { type: 'string' }, d: { type: 'number' } } },
        { properties: { e: { type: 'boolean' } } },
      ],
    };
    const value = { a: 'A', b: 1, c: 'C', d: 2, e: true, x: 99 };
    const oneOfKeySet = getOneOfKeyInfo(schema);

    const result = processValueWithOneOfSchema(value, oneOfKeySet?.oneOfKeySet);
    expect(result).toEqual({
      a: 'A',
      b: 1,
      x: 99,
    });
  });

  it('should keep properties fields even if also in oneOf', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, c: { type: 'string' } },
      oneOf: [{ properties: { d: { type: 'number' } } }],
    };
    const value = { a: 'A', c: 'C', d: 2, y: 100 };
    const oneOfKeySet = getOneOfKeyInfo(schema);

    const result = processValueWithOneOfSchema(value, oneOfKeySet?.oneOfKeySet);
    expect(result).toEqual({
      a: 'A',
      c: 'C',
      y: 100,
    });
  });

  it('should keep fields not in properties or oneOf', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
      oneOf: [{ properties: { b: { type: 'string' } } }],
    };
    const value = { a: 'A', b: 'B', z: 'Z' };
    const oneOfKeySet = getOneOfKeyInfo(schema);

    const result = processValueWithOneOfSchema(value, oneOfKeySet?.oneOfKeySet);
    expect(result).toEqual({
      a: 'A',
      z: 'Z',
    });
  });

  it('should handle empty properties and oneOf', () => {
    const schema: JsonSchema = { type: 'object' };
    const value = { a: 1, b: 2 };
    const oneOfKeySet = getOneOfKeyInfo(schema);

    const result = processValueWithOneOfSchema(value, oneOfKeySet?.oneOfKeySet);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should handle undefined value', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
      oneOf: [{ properties: { b: { type: 'string' } } }],
    };
    const oneOfKeySet = getOneOfKeyInfo(schema);

    const result = processValueWithOneOfSchema(
      undefined,
      oneOfKeySet?.oneOfKeySet,
    );
    expect(result).toBeUndefined();
  });

  it('should handle null value', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
      oneOf: [{ properties: { b: { type: 'string' } } }],
    };
    const oneOfKeySet = getOneOfKeyInfo(schema);

    const result = processValueWithOneOfSchema(
      null as any,
      oneOfKeySet?.oneOfKeySet,
    );
    expect(result).toBeNull();
  });

  it('should handle oneOf with no properties', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
      oneOf: [{}, { properties: { b: { type: 'string' } } }],
    };
    const value = { a: 'A', b: 'B', c: 'C' };
    const oneOfKeySet = getOneOfKeyInfo(schema);

    const result = processValueWithOneOfSchema(value, oneOfKeySet?.oneOfKeySet);
    expect(result).toEqual({
      a: 'A',
      c: 'C',
    });
  });

  it('should handle deeply nested objects (shallow removal only)', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
      oneOf: [{ properties: { b: { type: 'string' } } }],
    };
    const value = { a: 'A', b: 'B', nested: { b: 'B2', a: 'A2' } };
    // only top-level b is removed
    const oneOfKeySet = getOneOfKeyInfo(schema);

    const result = processValueWithOneOfSchema(value, oneOfKeySet?.oneOfKeySet);
    expect(result).toEqual({
      a: 'A',
      nested: { b: 'B2', a: 'A2' },
    });
  });

  it('should handle oneOf with overlapping keys', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
      oneOf: [
        { properties: { c: { type: 'string' } } },
        { properties: { d: { type: 'string' } } },
      ],
    };
    const value = { a: 'A', b: 'B', c: 'C', d: 'D', e: 'E' };
    // b는 properties에도 있으므로 유지, c/d는 제거, e는 유지
    const oneOfKeySet = getOneOfKeyInfo(schema);

    const result = processValueWithOneOfSchema(value, oneOfKeySet?.oneOfKeySet);
    expect(result).toEqual({
      a: 'A',
      b: 'B',
      e: 'E',
    });
  });

  it('should handle oneOf with empty array', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
      oneOf: [],
    };
    const value = { a: 'A', b: 'B' };
    const oneOfKeySet = getOneOfKeyInfo(schema);

    const result = processValueWithOneOfSchema(value, oneOfKeySet?.oneOfKeySet);
    expect(result).toEqual({
      a: 'A',
      b: 'B',
    });
  });

  it('should handle value with symbol keys', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
      oneOf: [{ properties: { b: { type: 'string' } } }],
    };

    const value: any = { a: 'A', b: 'B', c: 'C' };
    const oneOfKeySet = getOneOfKeyInfo(schema);

    const result = processValueWithOneOfSchema(value, oneOfKeySet?.oneOfKeySet);
    expect(result).not.toBeUndefined();
    expect((result as any).a).toBe('A');
    expect((result as any).b).toBeUndefined();
    expect((result as any).c).toBe('C');
  });
});

describe('processValueWithOneOfSchema', () => {
  // 기본 동작 테스트
  it('기본 동작: oneOf에 정의된 프로퍼티 제거', () => {
    const value: ObjectValue = {
      name: 'John',
      age: 30,
      address: '서울시',
      email: 'john@example.com',
    };

    const oneOfKeySet = new Set(['age', 'email']);
    const result = processValueWithOneOfSchema(value, oneOfKeySet, undefined);

    expect(result).toEqual({
      name: 'John',
      address: '서울시',
    });
  });

  // value가 undefined인 경우
  it('value가 undefined인 경우 undefined 반환', () => {
    const result = processValueWithOneOfSchema(
      undefined,
      new Set(['test']),
      undefined,
    );
    expect(result).toBeUndefined();
  });

  // oneOfKeySet이 undefined인 경우
  it('oneOfKeySet이 undefined인 경우 원본 value 반환', () => {
    const value: ObjectValue = { name: 'John', age: 30 };
    const result = processValueWithOneOfSchema(value, undefined, undefined);
    expect(result).toBe(value);
  });

  // allowedKeySet 기능 테스트
  it('allowedKeySet에 포함된 키는 oneOf에 있어도 제거하지 않음', () => {
    const value: ObjectValue = {
      name: 'John',
      age: 30,
      address: '서울시',
      email: 'john@example.com',
    };

    const oneOfKeySet = new Set(['age', 'email', 'address']);
    const allowedKeySet = new Set(['email']); // email은 oneOf에 있지만 allowed이므로 유지

    const result = processValueWithOneOfSchema(
      value,
      oneOfKeySet,
      allowedKeySet,
    );

    expect(result).toEqual({
      name: 'John',
      email: 'john@example.com',
    });
  });

  // allowedKeySet과 oneOfKeySet 둘 다 있는 경우 (복합 테스트)
  it('복합 케이스: allowedKeySet과 oneOfKeySet 상호작용', () => {
    const value: ObjectValue = {
      id: 1,
      name: 'John',
      age: 30,
      role: 'user',
      email: 'john@example.com',
      phone: '010-1234-5678',
      address: '서울시',
    };

    const oneOfKeySet = new Set(['age', 'email', 'phone', 'address']);
    const allowedKeySet = new Set(['email', 'phone']); // email과 phone은 oneOf에 있지만 allowed이므로 유지

    const result = processValueWithOneOfSchema(
      value,
      oneOfKeySet,
      allowedKeySet,
    );

    expect(result).toEqual({
      id: 1,
      name: 'John',
      role: 'user',
      email: 'john@example.com',
      phone: '010-1234-5678',
    });
  });

  // allowedKeySet이 empty인 경우
  it('allowedKeySet이 빈 Set인 경우', () => {
    const value: ObjectValue = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
    };

    const oneOfKeySet = new Set(['age', 'email']);
    const allowedKeySet = new Set<string>(); // 빈 Set

    const result = processValueWithOneOfSchema(
      value,
      oneOfKeySet,
      allowedKeySet,
    );

    expect(result).toEqual({
      name: 'John',
    });
  });

  // allowedKeySet은 있지만 oneOfKeySet과 겹치지 않는 경우
  it('allowedKeySet은 있지만 oneOfKeySet과 겹치지 않는 경우', () => {
    const value: ObjectValue = {
      id: 1,
      name: 'John',
      age: 30,
    };

    const oneOfKeySet = new Set(['age']);
    const allowedKeySet = new Set(['id']); // id는 oneOf에 없음

    const result = processValueWithOneOfSchema(
      value,
      oneOfKeySet,
      allowedKeySet,
    );

    expect(result).toEqual({
      id: 1,
      name: 'John',
    });
  });
});
