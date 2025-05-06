import { describe, expect, it } from 'vitest';

import { JsonSchema } from '@/schema-form/types';

import { flattenConditions } from '../utils/flattenConditions';

describe('flattenConditions', () => {
  it('should flatten const if-then-else with single if-then', () => {
    const schema = {
      type: 'object',
      properties: {
        x: {
          type: 'string',
        },
        y: {
          type: 'string',
        },
        z: {
          type: 'number',
        },
      },
      if: {
        properties: {
          x: {
            const: 'SHOW Y',
          },
        },
      },
      then: {
        required: ['y'],
      },
      else: {
        required: ['z'],
      },
    } satisfies JsonSchema;

    const expected = [
      {
        condition: { x: 'SHOW Y' },
        required: ['y'],
      },
      {
        condition: { x: 'SHOW Y' },
        required: ['z'],
        inverse: true,
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });

  it('should flatten enum if-then-else with single if-then', () => {
    const schema = {
      type: 'object',
      properties: {
        x: {
          type: 'string',
          enum: ['SHOW Y'],
        },
        y: {
          type: 'string',
        },
        else: {
          type: 'string',
        },
      },
      if: {
        properties: {
          x: {
            enum: ['SHOW Y'],
          },
        },
      },
      then: {
        required: ['y'],
      },
      else: {
        required: ['else'],
      },
    } satisfies JsonSchema;

    const expected = [
      {
        condition: { x: 'SHOW Y' },
        required: ['y'],
      },
      {
        condition: { x: 'SHOW Y' },
        required: ['else'],
        inverse: true,
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });

  it('should flatten enum if-then-else with single if-then', () => {
    const schema = {
      type: 'object',
      properties: {
        x: {
          type: 'string',
          enum: ['SHOW Y', 'SHOW Z'],
        },
        yz: {
          type: 'string',
        },
        else: {
          type: 'string',
        },
      },
      if: {
        properties: {
          x: {
            enum: ['SHOW Y', 'SHOW Z'],
          },
        },
      },
      then: {
        required: ['yz'],
      },
      else: {
        required: ['else'],
      },
    } satisfies JsonSchema;

    const expected = [
      {
        condition: { x: ['SHOW Y', 'SHOW Z'] },
        required: ['yz'],
      },
      {
        condition: { x: ['SHOW Y', 'SHOW Z'] },
        required: ['else'],
        inverse: true,
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });

  it('should flatten if-then-else with multiple if-then', () => {
    const schema = {
      type: 'object',
      properties: {
        a: {
          type: 'string',
        },
        b: {
          type: 'string',
        },
        c: {
          type: 'number',
        },
        d: {
          type: 'string',
        },
        e: {
          type: 'string',
        },
      },
      if: {
        properties: {
          a: {
            const: 'SHOW B',
          },
        },
      },
      then: {
        required: ['b'],
      },
      else: {
        if: {
          properties: {
            a: {
              const: 'SHOW C',
            },
          },
        },
        then: {
          required: ['c'],
        },
        else: {
          if: {
            properties: {
              a: {
                const: 'SHOW D',
              },
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

    const expected = [
      {
        condition: { a: 'SHOW B' },
        required: ['b'],
      },
      {
        condition: { a: 'SHOW C' },
        required: ['c'],
      },
      {
        condition: { a: 'SHOW D' },
        required: ['d'],
      },
      {
        condition: { a: ['SHOW B', 'SHOW C', 'SHOW D'] },
        required: ['e'],
        inverse: true,
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });

  // 새로운 테스트 케이스들

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

    const expected = [
      {
        condition: { x: 'SHOW Y' },
        required: ['y'],
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });

  it('should handle multiple properties in if condition', () => {
    const schema = {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: { type: 'string' },
        z: { type: 'string' },
      },
      if: {
        properties: {
          x: { const: 'VALUE X' },
          y: { const: 'VALUE Y' },
        },
      },
      then: {
        required: ['z'],
      },
      else: {
        required: ['x', 'y'],
      },
    } satisfies JsonSchema;

    const expected = [
      {
        condition: { x: 'VALUE X', y: 'VALUE Y' },
        required: ['z'],
      },
      {
        condition: { x: 'VALUE X', y: 'VALUE Y' },
        required: ['x', 'y'],
        inverse: true,
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });

  it('should handle different data types for const', () => {
    const schema = {
      type: 'object',
      properties: {
        num: { type: 'number' },
        str: { type: 'string' },
        bool: { type: 'boolean' },
        output: { type: 'string' },
      },
      if: {
        properties: {
          num: { const: 123 },
          bool: { const: true },
        },
      },
      then: {
        required: ['output'],
      },
      else: {
        required: ['str'],
      },
    } satisfies JsonSchema;

    const expected = [
      {
        condition: { num: '123', bool: 'true' },
        required: ['output'],
      },
      {
        condition: { num: '123', bool: 'true' },
        required: ['str'],
        inverse: true,
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });

  it('should handle deeply nested if-then-else (3+ levels)', () => {
    const schema = {
      type: 'object',
      properties: {
        level: { type: 'number' },
        option1: { type: 'string' },
        option2: { type: 'string' },
        option3: { type: 'string' },
        option4: { type: 'string' },
        option5: { type: 'string' },
      },
      if: {
        properties: {
          level: { const: 1 },
        },
      },
      then: {
        required: ['option1'],
      },
      else: {
        if: {
          properties: {
            level: { const: 2 },
          },
        },
        then: {
          required: ['option2'],
        },
        else: {
          if: {
            properties: {
              level: { const: 3 },
            },
          },
          then: {
            required: ['option3'],
          },
          else: {
            if: {
              properties: {
                level: { const: 4 },
              },
            },
            then: {
              required: ['option4'],
            },
            else: {
              required: ['option5'],
            },
          },
        },
      },
    } satisfies JsonSchema;

    const expected = [
      {
        condition: { level: '1' },
        required: ['option1'],
      },
      {
        condition: { level: '2' },
        required: ['option2'],
      },
      {
        condition: { level: '3' },
        required: ['option3'],
      },
      {
        condition: { level: '4' },
        required: ['option4'],
      },
      {
        condition: { level: ['1', '2', '3', '4'] },
        required: ['option5'],
        inverse: true,
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });

  it('should handle empty enum values', () => {
    const schema = {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: { type: 'string' },
      },
      if: {
        properties: {
          x: { enum: [] },
        },
      },
      then: {
        required: ['y'],
      },
      else: {
        required: ['x'],
      },
    } satisfies JsonSchema;

    const expected: any[] = [];
    expect(flattenConditions(schema)).toEqual(expected);
  });

  it('should handle schema without if-then-else', () => {
    const schema = {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: { type: 'string' },
      },
      required: ['x'],
    } satisfies JsonSchema;

    expect(flattenConditions(schema)).toEqual([]);
  });

  it('should handle if-then with empty required array', () => {
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
        required: [],
      },
      else: {
        required: ['x'],
      },
    } satisfies JsonSchema;

    const expected = [
      {
        condition: {
          x: 'SHOW Y',
        },
        required: ['x'],
        inverse: true,
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });

  it('should handle mixed const and enum conditions together', () => {
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

    const expected = [
      {
        condition: { type: 'error', status: ['pending', 'rejected'] },
        required: ['details', 'reason'],
      },
      {
        condition: { type: 'error', status: ['pending', 'rejected'] },
        required: ['details'],
        inverse: true,
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });

  it('should handle null and boolean values in conditions', () => {
    const schema = {
      type: 'object',
      properties: {
        isEnabled: { type: 'boolean' },
        hasValue: { type: 'boolean' },
        value: { type: 'string' },
        fallback: { type: 'string' },
      },
      if: {
        properties: {
          isEnabled: { const: true },
          hasValue: { const: false },
        },
      },
      then: {
        required: ['fallback'],
      },
      else: {
        required: ['value'],
      },
    } satisfies JsonSchema;

    const expected = [
      {
        condition: { isEnabled: 'true', hasValue: 'false' },
        required: ['fallback'],
      },
      {
        condition: { isEnabled: 'true', hasValue: 'false' },
        required: ['value'],
        inverse: true,
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });
});
