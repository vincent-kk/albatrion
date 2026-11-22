import type { JSONSchema } from '@canard/schema-form';
import { afterEach, describe, expect, it } from 'vitest';

import { plugin as plugin2019 } from '../2019/index';
import { plugin as plugin2020 } from '../2020/index';
import { plugin } from '../default/index';

/** Creates equal conditions under an ordinary name and a literal percent name. */
const rootFor = (name: string): JSONSchema => ({
  type: 'object',
  definitions: { yes: { const: true } },
  properties: {
    'a b': {
      if: { properties: { receipt: { const: false } }, required: ['receipt'] },
    },
    'a/b': {
      if: { properties: { receipt: { const: false } }, required: ['receipt'] },
    },
    [name]: {
      type: 'object',
      if: {
        type: 'object',
        properties: { receipt: { $ref: '#/definitions/yes' } },
        required: ['receipt'],
      },
    },
  },
});

describe.each([
  ['default', plugin],
  ['2019', plugin2019],
  ['2020', plugin2020],
] as const)('%s percent names (round-2 ajv8-plugin 1)', (_entry, plugin) => {
  afterEach(() => plugin.validator.configure({ directGuardCompile: true }));
  describe.each([true, false])(
    'directGuardCompile=%s',
    (directGuardCompile) => {
      it('evaluates encoded URI separators and preserves literal percent names', () => {
        plugin.validator.configure({ directGuardCompile });
        const root: JSONSchema = {
          properties: {
            field: { if: { type: 'string' } },
            'a%2Fb': { if: { type: 'string' } },
          },
        };
        try {
          for (const pointer of [
            '#%2Fproperties%2Ffield%2Fif',
            '#%2Fproperties%2Fa%252Fb%2Fif',
            '/properties/a%2Fb/if',
          ]) {
            const guard = plugin.validator.compileGuard(root, pointer);
            expect(guard('x')).toBe(true);
            expect(guard(1)).toBe(false);
          }
        } finally {
          plugin.validator.release(root);
        }
      });

      it.each(['100%', '50%off', 'a%20b', 'a%2Fb'])(
        'evaluates %s like the ordinary property name',
        (name) => {
          plugin.validator.configure({ directGuardCompile });
          const ordinary = rootFor('ordinary');
          const special = rootFor(name);
          try {
            const reference = plugin.validator.compileGuard(
              ordinary,
              '/properties/ordinary/if',
            );
            const actual = plugin.validator.compileGuard(
              special,
              '/properties/' + name + '/if',
            );
            expect([
              actual({ receipt: true }),
              actual({ receipt: false }),
            ]).toEqual([
              reference({ receipt: true }),
              reference({ receipt: false }),
            ]);
          } finally {
            plugin.validator.release(ordinary);
            plugin.validator.release(special);
          }
        },
      );
    },
  );
});
