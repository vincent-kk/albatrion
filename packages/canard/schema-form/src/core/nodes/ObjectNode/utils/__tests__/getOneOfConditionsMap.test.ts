import { describe, expect, it } from 'vitest';

import type { ObjectSchema } from '@/schema-form/types';

import { getOneOfConditionsMap } from '../getIfConditionsMap/getOneOfConditionsMap';

describe('getOneOfConditionsMap', () => {
  it('should return null when oneOf is not available', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };

    expect(getOneOfConditionsMap(schema)).toBeNull();
  });

  it('should return null when oneOf is not an array', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      // @ts-expect-error 테스트를 위해 잘못된 타입 사용
      oneOf: 'invalid',
    };

    expect(getOneOfConditionsMap(schema)).toBeNull();
  });

  it('should create conditions map with const value', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        type: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
      },
      oneOf: [
        {
          properties: {
            type: { const: 'personal' },
            name: { type: 'string' },
          },
          required: ['name'],
        },
      ],
    };

    const result = getOneOfConditionsMap(schema);
    expect(result).toBeInstanceOf(Map);
    expect(result?.get('name')).toEqual(['@.type==="personal"']);
  });

  it('should create conditions map with enum value', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        type: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
      },
      oneOf: [
        {
          properties: {
            type: { enum: ['business'] },
            email: { type: 'string' },
          },
          required: ['email'],
        },
      ],
    };

    const result = getOneOfConditionsMap(schema);
    expect(result).toBeInstanceOf(Map);
    expect(result?.get('email')).toEqual(['"business"===@.type']);
  });

  it('should create conditions map with multiple enum values', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        type: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
      },
      oneOf: [
        {
          properties: {
            type: { enum: ['business', 'corporate'] },
            email: { type: 'string' },
          },
          required: ['email'],
        },
      ],
    };

    const result = getOneOfConditionsMap(schema);
    expect(result).toBeInstanceOf(Map);
    expect(result?.get('email')).toEqual([
      '["business","corporate"].includes(@.type)',
    ]);
  });

  it('should skip invalid oneOf schemas', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        type: { type: 'string' },
        name: { type: 'string' },
      },
      oneOf: [
        {
          // 유효하지 않은 스키마 (properties 없음)
          required: ['name'],
        } as any,
      ],
    };

    const result = getOneOfConditionsMap(schema);
    expect(result).toBeInstanceOf(Map);
    expect(result?.size).toBe(0);
  });

  it('should create conditions map for multiple fields', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        type: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        company: { type: 'string' },
      },
      oneOf: [
        {
          properties: {
            type: { const: 'business' },
          },
          required: ['email', 'company'],
        },
      ],
    };

    const result = getOneOfConditionsMap(schema);
    expect(result).toBeInstanceOf(Map);
    expect(result?.get('email')).toEqual(['@.type==="business"']);
    expect(result?.get('company')).toEqual(['@.type==="business"']);
  });

  it('should merge conditions for the same field from multiple oneOf schemas', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        type: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
      },
      oneOf: [
        {
          properties: {
            type: { const: 'personal' },
          },
          required: ['name'],
        },
        {
          properties: {
            type: { const: 'business' },
          },
          required: ['name', 'email'],
        },
      ],
    };

    const result = getOneOfConditionsMap(schema);
    expect(result).toBeInstanceOf(Map);

    // result가 null이 아닌 경우에만 검증
    if (result) {
      const nameConditions = result.get('name') || [];
      expect(nameConditions.sort()).toEqual(
        ['@.type==="business"', '@.type==="personal"'].sort(),
      );
      expect(result.get('email')).toEqual(['@.type==="business"']);
    } else {
      // 이 테스트 케이스에서는 result가 null이 아니어야 함
      expect(result).not.toBeNull();
    }
  });

  it('should handle numeric const values', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        code: { type: 'number' },
        message: { type: 'string' },
      },
      oneOf: [
        {
          properties: {
            code: { const: 200 },
          },
          required: ['message'],
        },
      ],
    };

    const result = getOneOfConditionsMap(schema);
    expect(result).toBeInstanceOf(Map);
    expect(result?.get('message')).toEqual(['@.code===200']);
  });

  it('should handle boolean const values', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        isActive: { type: 'boolean' },
        activationDate: { type: 'string' },
      },
      oneOf: [
        {
          properties: {
            isActive: { const: true },
          },
          required: ['activationDate'],
        },
      ],
    };

    const result = getOneOfConditionsMap(schema);
    expect(result).toBeInstanceOf(Map);
    expect(result?.get('activationDate')).toEqual(['@.isActive===true']);
  });

  it('should handle null const values', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        value: { type: 'string', nullable: true },
        fallback: { type: 'string' },
      },
      oneOf: [
        {
          properties: {
            value: { const: null },
          },
          required: ['fallback'],
        },
      ],
    };

    const result = getOneOfConditionsMap(schema);
    expect(result).toBeInstanceOf(Map);
    expect(result?.get('fallback')).toEqual(['@.value===null']);
  });
});
