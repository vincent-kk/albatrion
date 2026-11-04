import { expect, it } from 'vitest';

import { blueprint } from '../blueprint';

// filid:contract fixed-first-load-shape
it.each([
  ['array', { type: 'array', items: { type: 'string' } }],
  ['union', { type: ['string', 'number'] }],
  ['oneOf', { type: 'string', oneOf: [{ minLength: 1 }] }],
  ['anyOf', { type: 'string', anyOf: [{ minLength: 1 }] }],
  [
    'container default',
    { type: 'object', default: {}, properties: { leaf: { type: 'string' } } },
  ],
  ['container null default', { type: 'object', nullable: true, default: null }],
  ['whole-value', { type: 'object', options: { terminal: true } }],
  ['control', { type: 'string', controls: { watch: [] } }],
] as const)(
  'T2 rejects a baseline %s anywhere in the new route',
  (_name, child) => {
    expect(
      Reflect.get(
        blueprint({
          type: 'object',
          properties: { value: { type: 'string' } },
          if: {},
          then: { properties: { value: { minLength: 2 } } },
        }),
        'fixedFirstLoadPlan',
      ),
    ).toBeDefined();
    const result = blueprint({
      type: 'object',
      properties: { value: { type: 'string' }, child },
      if: {},
      then: { properties: { value: { minLength: 2 } } },
    });
    expect(Reflect.get(result, 'fixedFirstLoadPlan')).toBeUndefined();
  },
);
it('T2 rejects accessors without invoking the overlay getter for its proof', () => {
  expect(
    Reflect.get(
      blueprint({
        type: 'object',
        properties: { value: { type: 'string' } },
        if: {},
        then: { properties: { value: { minLength: 2 } } },
      }),
      'fixedFirstLoadPlan',
    ),
  ).toBeDefined();
  const constraint = Object.defineProperty({}, 'minLength', {
    enumerable: true,
    get: () => 2,
  });
  const result = blueprint({
    type: 'object',
    properties: { value: { type: 'string' } },
    if: {},
    then: { properties: { value: constraint } },
  });
  expect(Reflect.get(result, 'fixedFirstLoadPlan')).toBeUndefined();
});
it.each([NaN, Infinity, '2', -1, 1.5])(
  'T2 rejects non-finite or nonnumeric constraint %s',
  (minLength) => {
    expect(
      Reflect.get(
        blueprint({
          type: 'object',
          properties: { value: { type: 'string' } },
          if: {},
          then: { properties: { value: { minLength: 2 } } },
        }),
        'fixedFirstLoadPlan',
      ),
    ).toBeDefined();
    const result = blueprint({
      type: 'object',
      properties: { value: { type: 'string' } },
      if: {},
      then: { properties: { value: { minLength } } },
    });
    expect(Reflect.get(result, 'fixedFirstLoadPlan')).toBeUndefined();
  },
);
it('T2 rejects an alternative child identity', () => {
  expect(
    Reflect.get(
      blueprint({
        type: 'object',
        properties: { value: { type: 'string' } },
        if: {},
        then: { properties: { value: { minLength: 2 } } },
      }),
      'fixedFirstLoadPlan',
    ),
  ).toBeDefined();
  const result = blueprint({
    type: 'object',
    properties: { value: { type: 'string' } },
    if: {},
    then: { properties: { value: { type: 'number' } } },
  });
  expect(Reflect.get(result, 'fixedFirstLoadPlan')).toBeUndefined();
});
