import { describe, expect, it } from 'vitest';

import { JsonSchema } from '@/schema-form/types';

import { getFieldConditionMap } from '../getFieldConditionMap/getFieldConditionMap';

describe('getFieldConditionMap', () => {
  it('should return undefined when schema has no conditions', () => {
    const schema = {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: { type: 'string' },
      },
      required: ['x'],
    } satisfies JsonSchema;

    expect(getFieldConditionMap(schema)).toBeUndefined();
  });

  it('should handle simple if-then-else condition', () => {
    const schema = {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: { type: 'string' },
        z: { type: 'number' },
      },
      if: {
        properties: {
          x: { const: 'SHOW Y' },
        },
      },
      then: {
        required: ['y'],
      },
      else: {
        required: ['z'],
      },
    } satisfies JsonSchema;

    const result = getFieldConditionMap(schema);
    expect(result).toBeDefined();

    // x는 조건에 사용되므로 항상 true
    expect(result?.get('x')).toBe(true);

    // y는 x가 'SHOW Y'일 때 필요
    const yConditions = result?.get('y');
    expect(Array.isArray(yConditions)).toBe(true);
    expect(yConditions).toEqual([{ condition: { x: 'SHOW Y' } }]);

    // z는 x가 'SHOW Y'가 아닐 때 필요
    const zConditions = result?.get('z');
    expect(Array.isArray(zConditions)).toBe(true);
    expect(zConditions).toEqual([
      { condition: { x: 'SHOW Y' }, inverse: true },
    ]);
  });

  it('should handle conditions with multiple fields', () => {
    const schema = {
      type: 'object',
      properties: {
        type: { type: 'string' },
        status: { type: 'string' },
        details: { type: 'string' },
        reason: { type: 'string' },
      },
      if: {
        properties: {
          type: { const: 'error' },
          status: { enum: ['pending', 'rejected'] },
        },
      },
      then: {
        required: ['details', 'reason'],
      },
      else: {
        required: ['details'],
      },
    } satisfies JsonSchema;

    const result = getFieldConditionMap(schema);
    expect(result).toBeDefined();

    // type과 status는 조건에 사용되므로 항상 true
    expect(result?.get('type')).toBe(true);
    expect(result?.get('status')).toBe(true);

    // details는 모든 경우에 필요하므로 두 개의 조건이 있어야 함
    const detailsConditions = result?.get('details');
    expect(Array.isArray(detailsConditions)).toBe(true);
    expect(detailsConditions).toHaveLength(2);
    expect(detailsConditions).toEqual([
      { condition: { type: 'error', status: ['pending', 'rejected'] } },
      {
        condition: { type: 'error', status: ['pending', 'rejected'] },
        inverse: true,
      },
    ]);

    // reason은 type이 error이고 status가 pending 또는 rejected일 때만 필요
    const reasonConditions = result?.get('reason');
    expect(Array.isArray(reasonConditions)).toBe(true);
    expect(reasonConditions).toEqual([
      { condition: { type: 'error', status: ['pending', 'rejected'] } },
    ]);
  });

  it('should handle nested if-then-else conditions', () => {
    const schema = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
        c: { type: 'number' },
        d: { type: 'string' },
        e: { type: 'string' },
      },
      if: {
        properties: {
          a: { const: 'SHOW B' },
        },
      },
      then: {
        required: ['b'],
      },
      else: {
        if: {
          properties: {
            a: { const: 'SHOW C' },
          },
        },
        then: {
          required: ['c'],
        },
        else: {
          if: {
            properties: {
              a: { const: 'SHOW D' },
            },
          },
          then: {
            required: ['d'],
          },
          else: {
            required: ['e'],
          },
        },
      },
    } satisfies JsonSchema;

    const result = getFieldConditionMap(schema);
    expect(result).toBeDefined();

    // a는 조건에 사용되므로 항상 true
    expect(result?.get('a')).toBe(true);

    // b는 a가 'SHOW B'일 때 필요
    const bConditions = result?.get('b');
    expect(Array.isArray(bConditions)).toBe(true);
    expect(bConditions).toEqual([{ condition: { a: 'SHOW B' } }]);

    // c는 a가 'SHOW C'일 때 필요
    const cConditions = result?.get('c');
    expect(Array.isArray(cConditions)).toBe(true);
    expect(cConditions).toEqual([{ condition: { a: 'SHOW C' } }]);

    // d는 a가 'SHOW D'일 때 필요
    const dConditions = result?.get('d');
    expect(Array.isArray(dConditions)).toBe(true);
    expect(dConditions).toEqual([{ condition: { a: 'SHOW D' } }]);

    // e는 a가 'SHOW B', 'SHOW C', 'SHOW D' 중 어느 것도 아닐 때 필요
    const eConditions = result?.get('e');
    expect(Array.isArray(eConditions)).toBe(true);
    expect(eConditions).toEqual([
      { condition: { a: ['SHOW B', 'SHOW C', 'SHOW D'] }, inverse: true },
    ]);
  });

  it('should handle if-then without else', () => {
    const schema = {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: { type: 'string' },
      },
      if: {
        properties: {
          x: { const: 'SHOW Y' },
        },
      },
      then: {
        required: ['y'],
      },
    } satisfies JsonSchema;

    const result = getFieldConditionMap(schema);
    expect(result).toBeDefined();

    // x는 조건에 사용되므로 항상 true
    expect(result?.get('x')).toBe(true);

    // y는 x가 'SHOW Y'일 때 필요
    const yConditions = result?.get('y');
    expect(Array.isArray(yConditions)).toBe(true);
    expect(yConditions).toEqual([{ condition: { x: 'SHOW Y' } }]);
  });

  it('should combine multiple conditions for the same field', () => {
    const schema = {
      type: 'object',
      properties: {
        userType: { type: 'string' },
        adminSection: { type: 'object' },
        userSection: { type: 'object' },
        guestSection: { type: 'object' },
      },
      if: {
        properties: {
          userType: { const: 'admin' },
        },
      },
      then: {
        required: ['adminSection'],
      },
      else: {
        if: {
          properties: {
            userType: { const: 'user' },
          },
        },
        then: {
          required: ['userSection', 'adminSection'],
        },
        else: {
          required: ['guestSection'],
        },
      },
    } satisfies JsonSchema;

    const result = getFieldConditionMap(schema);
    expect(result).toBeDefined();

    // userType은 조건에 사용되므로 항상 true
    expect(result?.get('userType')).toBe(true);

    // adminSection은 userType이 'admin'이거나 'user'일 때 필요
    const adminSectionConditions = result?.get('adminSection');
    expect(Array.isArray(adminSectionConditions)).toBe(true);
    expect(adminSectionConditions).toHaveLength(2);
    expect(adminSectionConditions).toContainEqual({
      condition: { userType: 'admin' },
    });
    expect(adminSectionConditions).toContainEqual({
      condition: { userType: 'user' },
    });

    // userSection은 userType이 'user'일 때 필요
    const userSectionConditions = result?.get('userSection');
    expect(Array.isArray(userSectionConditions)).toBe(true);
    expect(userSectionConditions).toEqual([
      { condition: { userType: 'user' } },
    ]);

    // guestSection은 userType이 'admin'이나 'user'가 아닐 때 필요
    const guestSectionConditions = result?.get('guestSection');
    expect(Array.isArray(guestSectionConditions)).toBe(true);
    expect(guestSectionConditions).toEqual([
      { condition: { userType: ['admin', 'user'] }, inverse: true },
    ]);
  });
});
