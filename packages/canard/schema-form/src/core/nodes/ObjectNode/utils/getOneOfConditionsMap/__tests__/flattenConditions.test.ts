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
        condition: true,
        required: ['z'],
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });

  it('should flatten enum if-then-else  with single if-then', () => {
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
        condition: true,
        required: ['else'],
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });

  it('should flatten enum if-then-else  with single if-then', () => {
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
        condition: true,
        required: ['else'],
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
        condition: true,
        required: ['e'],
      },
    ];
    expect(flattenConditions(schema)).toEqual(expected);
  });
});
