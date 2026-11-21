import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../index';

describe.each([
  [
    'draft-07',
    () => new Ajv({ allErrors: true, strict: false }),
    createValidator,
  ],
] as const)('%s', (_dialect, instance, adapterFor) => {
  it.each([
    [
      'two pointers',
      '#/components/b',
      { type: 'string', rule: true },
      ['rule'],
    ],
    [
      'three pointers',
      '#/components/a',
      { type: 'string', rule: true },
      ['rule'],
    ],
    ['registered key', '#/components/a', { $ref: 'target-key' }, ['minLength']],
    [
      'selected default',
      '#/default/node',
      { type: 'string', rule: true },
      ['rule'],
    ],
    [
      'macro reference',
      '#/components/a',
      { mref: true },
      ['minLength', 'mref'],
    ],
    [
      'nested macro',
      '#/components/a',
      { mnext: true },
      ['minLength', 'mref', 'mnext'],
    ],
    [
      'asynchronous macro',
      '#/components/a',
      { masync: true },
      ['remote', 'masync'],
    ],
  ] as const)(
    'tracks %s through the selected pointer chain (DETAIL compilation dependencies)',
    async (label, pointer, leaf, keywords) => {
      const ajv = instance();
      const address = 'https://review.invalid/target';
      ajv.addKeyword({
        keyword: 'remote',
        async: true,
        validate: async (_schema: unknown, value: unknown) => value === 'ok',
      });
      ajv.addKeyword({
        keyword: 'rule',
        validate: (_schema: unknown, value: unknown) => value === 'ok',
      });
      ajv.addKeyword({
        keyword: 'mref',
        macro: () => ({ $ref: address }),
      });
      ajv.addKeyword({
        keyword: 'mnext',
        macro: () => ({ mref: true }),
      });
      ajv.addKeyword({
        keyword: 'masync',
        macro: () => ({ remote: true }),
      });
      ajv.addSchema(
        { $id: address, type: 'string', minLength: 3 },
        'target-key',
      );
      const candidate = { value: 'x', num: 1, str: 's', selector: 'af' };
      // The contextual guard compiles the whole root synchronously.
      const guardForms =
        label === 'asynchronous macro' ? [false] : [false, true];
      for (const contextual of guardForms) {
        const root = {
          type: 'object',
          definitions: { n: { type: 'number' } },
          $defs: { s: { type: 'string' } },
          default: { node: { type: 'string', rule: true } },
          components: {
            a: { $ref: '#/components/b' },
            b: { $ref: '#/components/c' },
            c: leaf,
            g: { required: ['flag'] },
          },
          properties: {
            value: { $ref: pointer },
            num: { $ref: '#/definitions/n' },
            str: { $ref: '#/$defs/s' },
          },
          if: contextual ? { $ref: '#/components/g' } : { required: ['flag'] },
        } satisfies Parameters<ReturnType<typeof adapterFor>['compile']>[0];
        const selected = { $ref: 'container' };
        if (label === 'registered key') ajv.addSchema(root, 'container');
        const adapter = adapterFor(ajv);
        const guard =
          label === 'registered key'
            ? undefined
            : adapter.compileGuard(root, '/if');
        if (guard) expect(guard({ flag: 1 })).toBe(true);
        const schema = label === 'registered key' ? selected : root;
        const validate = adapter.compile(schema);
        const second = adapterFor(ajv).compile(schema);
        const expected = keywords.map((keyword) => ({
          keyword,
          dataPath: '/value',
        }));
        expect(await validate(candidate)).toMatchObject(expected);
        expect(await second(candidate)).toMatchObject(expected);
        if (guard) expect(guard({})).toBe(false);
        if (label === 'registered key') ajv.removeSchema('container');
      }
    },
  );
});
