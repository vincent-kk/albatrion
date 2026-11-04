import { afterEach, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../../blueprint';
import {
  expectFixedFirstLoadRoute,
  observeFixedFirstLoad,
} from './fixtures/observeFixedFirstLoad';

/** Fixed membership with scalar defaults and both constraint branches. */
const schema: BlueprintSchema = {
  type: 'object',
  properties: {
    kind: { type: 'string', default: 'a' },
    value: { type: 'string', default: 'x' },
  },
  if: { properties: { kind: { const: 'a' } } },
  then: { properties: { value: { minLength: 2 } } },
  else: { properties: { value: { maxLength: 3 } } },
};
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
// filid:contract fixed-first-load-hosts
it('T8 binds independent nested hosts and integer/escaped names in ordinary order', () => {
  const fixture = {
    type: 'object',
    properties: {
      '2': schema,
      '1': schema,
      'a/b': schema,
      '~tail': { type: 'string' },
    },
  };
  const actual = observeFixedFirstLoad(fixture);
  const oracle = observeFixedFirstLoad(fixture, { general: true });
  expect(actual.snapshot()).toEqual(oracle.snapshot());
  expect(actual.root.children?.map((child) => child.name)).toEqual([
    '1',
    '2',
    'a/b',
    '~tail',
  ]);
  expectFixedFirstLoadRoute(actual);
});
it.each([
  {
    type: 'object',
    properties: { group: schema },
    if: {},
    then: { properties: { group: schema } },
  },
  { type: 'array', items: schema, default: [{}] },
  { ...schema, oneOf: [{ properties: { other: { type: 'string' } } }] },
])('T8 unsupported hosts fall back without extra commits', (fixture) => {
  const actual = observeFixedFirstLoad(fixture);
  const oracle = observeFixedFirstLoad(fixture, { general: true });
  expect(actual.snapshot()).toEqual(oracle.snapshot());
  expect(actual.prepared).toBe(false);
  expect(actual.work.commits).toBe(1);
});
