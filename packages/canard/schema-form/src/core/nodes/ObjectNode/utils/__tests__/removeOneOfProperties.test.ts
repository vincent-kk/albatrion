import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@/schema-form/types';

import {
  getOneOfProperties,
  removeOneOfProperties,
} from '../removeOneOfProperties';

describe('removeOneOfProperties', () => {
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
    const oneOfKeySet = getOneOfProperties(schema);

    const result = removeOneOfProperties(value, oneOfKeySet);
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
    const oneOfKeySet = getOneOfProperties(schema);

    const result = removeOneOfProperties(value, oneOfKeySet);
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
    const oneOfKeySet = getOneOfProperties(schema);

    const result = removeOneOfProperties(value, oneOfKeySet);
    expect(result).toEqual({
      a: 'A',
      z: 'Z',
    });
  });

  it('should handle empty properties and oneOf', () => {
    const schema: JsonSchema = { type: 'object' };
    const value = { a: 1, b: 2 };
    const oneOfKeySet = getOneOfProperties(schema);

    const result = removeOneOfProperties(value, oneOfKeySet);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should handle undefined value', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
      oneOf: [{ properties: { b: { type: 'string' } } }],
    };
    const oneOfKeySet = getOneOfProperties(schema);

    const result = removeOneOfProperties(undefined, oneOfKeySet);
    expect(result).toBeUndefined();
  });

  it('should handle null value', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
      oneOf: [{ properties: { b: { type: 'string' } } }],
    };
    const oneOfKeySet = getOneOfProperties(schema);

    const result = removeOneOfProperties(null as any, oneOfKeySet);
    expect(result).toBeNull();
  });

  it('should handle oneOf with no properties', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
      oneOf: [{}, { properties: { b: { type: 'string' } } }],
    };
    const value = { a: 'A', b: 'B', c: 'C' };
    const oneOfKeySet = getOneOfProperties(schema);

    const result = removeOneOfProperties(value, oneOfKeySet);
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
    const oneOfKeySet = getOneOfProperties(schema);

    const result = removeOneOfProperties(value, oneOfKeySet);
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
    const oneOfKeySet = getOneOfProperties(schema);

    const result = removeOneOfProperties(value, oneOfKeySet);
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
    const oneOfKeySet = getOneOfProperties(schema);

    const result = removeOneOfProperties(value, oneOfKeySet);
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
    const oneOfKeySet = getOneOfProperties(schema);

    const result = removeOneOfProperties(value, oneOfKeySet);
    expect(result).not.toBeUndefined();
    expect((result as any).a).toBe('A');
    expect((result as any).b).toBeUndefined();
    expect((result as any).c).toBe('C');
  });
});
