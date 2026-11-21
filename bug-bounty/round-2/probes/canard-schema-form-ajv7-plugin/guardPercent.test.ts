import { describe, expect, it } from 'vitest';

import { plugin } from '../../index';

/** The if-schema references root definitions, so the plugin compiles it through the registered root pointer. */
const rootFor = (name: string) => ({
  type: 'object',
  definitions: { Yes: { const: true } },
  properties: {
    [name]: {
      type: 'object',
      properties: { receipt: { type: 'boolean' } },
      if: { properties: { receipt: { $ref: '#/definitions/Yes' } }, required: ['receipt'] },
      then: {},
    },
  },
});

describe('AJV7 root-pointer guard for a property name containing %', () => {
  it.each(['ab', '100%', '50%off'])(
    'compiles the RFC 6901 pointer /properties/%s/if and evaluates it',
    (name) => {
      const guard = plugin.validator.compileGuard(
        rootFor(name),
        '/properties/' + name + '/if',
      );
      expect([guard({ receipt: true }), guard({ receipt: false })]).toEqual([true, false]);
    },
  );

  it('evaluates the guard of property "a%20b", not the guard of its sibling "a b"', () => {
    const root = {
      type: 'object',
      definitions: { Yes: { const: true } },
      properties: {
        'a b': { type: 'object', if: { properties: { receipt: { const: false } }, required: ['receipt'] }, then: {} },
        'a%20b': { type: 'object', if: { properties: { receipt: { $ref: '#/definitions/Yes' } }, required: ['receipt'] }, then: {} },
      },
    };
    let verdict: unknown;
    try {
      verdict = plugin.validator.compileGuard(root, '/properties/a%20b/if')({ receipt: true });
    } catch (error) {
      verdict = 'THROW: ' + (error as Error).message;
    }
    expect(verdict).toBe(true);
  });
});
