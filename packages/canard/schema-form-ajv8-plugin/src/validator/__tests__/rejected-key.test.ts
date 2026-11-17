import type { ErrorObject } from 'ajv';
import { describe, expect, it } from 'vitest';

import { transformErrors } from '../utils/transformErrors';

/** Builds an AJV issue with the routing fields relevant to the case. */
const issue = (keyword: string, instancePath: string, schemaPath: string, params: Record<string, unknown>): ErrorObject => ({
  keyword,
  instancePath,
  schemaPath,
  params,
});

describe('FRAGMENT-020 VALIDATE-043 FRAGMENT-053 rejected keys', () => {
  it.each([
    ['additionalProperties', 'additionalProperty'],
    ['unevaluatedProperties', 'unevaluatedProperty'],
    ['propertyNames', 'propertyName'],
  ])('reports the rejected key from %s parameters', (keyword, parameter) => {
    const result = transformErrors([issue(keyword, '', `#/${keyword}`, { [parameter]: 'extra' })]);
    expect(result[0]).toMatchObject({ dataPath: '', rejectedKey: 'extra' });
  });

  it('routes a false property schema to its host', () => {
    const schema = { properties: { forbidden: false } };
    const result = transformErrors([issue('false schema', '/forbidden', '#/properties/forbidden', {})], schema);
    expect(result[0]).toMatchObject({ dataPath: '', rejectedKey: 'forbidden' });
  });

  it('reports a single not-required key but leaves an ambiguous pair on the host', () => {
    const single = { not: { required: ['blocked'] } };
    const pair = { not: { required: ['first', 'second'] } };
    expect(transformErrors([issue('not', '', '#/not', {})], single)[0]).toMatchObject({ rejectedKey: 'blocked' });
    expect(transformErrors([issue('not', '', '#/not', {})], pair)[0].rejectedKey).toBeUndefined();
  });

  it('answers a repeated not.required lookup from the cache, misses included', () => {
    const root = { properties: { a: { not: { required: ['x'] } }, b: { not: { required: ['p', 'q'] } } } };
    const errors = [issue('not', '/a', '#/properties/a/not', {}), issue('not', '/b', '#/properties/b/not', {})];
    const cache = new Map<string, string | undefined>();
    expect(transformErrors(errors, root, undefined, cache).map((result) => result.rejectedKey)).toEqual(['x', undefined]);
    expect([...cache]).toEqual([['#/properties/a/not', 'x'], ['#/properties/b/not', undefined]]);
    root.properties.a.not.required = ['y'];
    root.properties.b.not.required = ['z'];
    expect(transformErrors(errors, root, undefined, cache).map((result) => result.rejectedKey)).toEqual(['x', undefined]);
  });

  it('uses an empty root pointer and appends a missing required child', () => {
    expect(transformErrors([issue('type', '', '#/type', { type: 'string' })])[0].dataPath).toBe('');
    expect(transformErrors([issue('required', '', '#/required', { missingProperty: 'child' })])[0].dataPath).toBe('/child');
  });
});
