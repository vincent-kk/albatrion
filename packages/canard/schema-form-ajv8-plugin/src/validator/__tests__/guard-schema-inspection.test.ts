import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin as plugin2019 } from '../../2019/validatorPlugin';
import { ajvValidatorPlugin as plugin2020 } from '../../2020/validatorPlugin';
import { ajvValidatorPlugin } from '../../default/validatorPlugin';
import { isSelfContainedGuard } from '../utils/isSelfContainedGuard';
import { resolveGuardSchema } from '../utils/resolveGuardSchema';

describe.each([
  { dialect: 'default', plugin: ajvValidatorPlugin, Constructor: Ajv },
  { dialect: '2019', plugin: plugin2019, Constructor: Ajv2019 },
  { dialect: '2020', plugin: plugin2020, Constructor: Ajv2020 },
] as const)('direct guard $dialect', ({ plugin: ajvValidatorPlugin }) => {
  afterEach(() => {
    ajvValidatorPlugin.configure({ directGuardCompile: true });
    vi.restoreAllMocks();
  });

  it('caches recursive self-containment checks per subschema object', () => {
    const cache = new WeakMap<object, boolean>();
    const keys = vi.fn(() => ['type']);
    const schema = {
      allOf: [new Proxy({ type: 'string' }, { ownKeys: keys })],
    };
    expect(isSelfContainedGuard(schema, cache)).toBe(true);
    expect(isSelfContainedGuard(schema, cache)).toBe(true);
    expect(keys).toHaveBeenCalledTimes(1);
    for (const key of [
      '$ref',
      '$dynamicRef',
      '$recursiveRef',
      '$id',
      '$anchor',
      '$dynamicAnchor',
      '$recursiveAnchor',
    ])
      expect(
        isSelfContainedGuard({ annotation: [{ [key]: 'value' }] }, cache),
      ).toBe(false);
  });

  it('resolves escaped pointers to the original guard object', () => {
    const schema = { type: 'string' };
    const copy = { type: 'object', definitions: { 'a/b~c': { if: schema } } };
    expect(resolveGuardSchema(copy, '#/definitions/a~1b~0c/if')).toBe(schema);
    expect(resolveGuardSchema(copy, '')).toBe(copy);
    expect(resolveGuardSchema({ if: false }, '/if')).toBe(false);
    expect(resolveGuardSchema(copy, '/missing/if')).toBeUndefined();
    const encodedCopy = {
      properties: {
        'a b': { if: schema },
        'a%20b': { if: false },
        'a%zz': { if: schema },
      },
      definitions: { 'a/b': { if: schema } },
    };
    expect
      .soft(resolveGuardSchema(encodedCopy, '#/properties/a%20b/if'))
      .toBe(schema);
    expect
      .soft(resolveGuardSchema(encodedCopy, '#/properties/a%20b/if'))
      .toBe(resolveGuardSchema(encodedCopy, '/properties/a b/if'));
    expect
      .soft(resolveGuardSchema(encodedCopy, '#/definitions/a%7E1b/if'))
      .toBe(schema);
    expect
      .soft(resolveGuardSchema(encodedCopy, '#/properties/a%zz/if'))
      .toBeUndefined();
    expect(resolveGuardSchema(encodedCopy, '/properties/a%20b/if')).toBe(false);
  });
});
