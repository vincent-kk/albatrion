import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';

import { createValidator as create2019Validator } from '../2019/index';
import { createValidator as create2020Validator } from '../2020/index';
import { createValidator } from '../default/index';

describe.each([
  [
    'draft-07',
    () => new Ajv({ allErrors: true, strict: false }),
    createValidator,
  ],
  [
    '2019-09',
    () => new Ajv2019({ allErrors: true, strict: false }),
    create2019Validator,
  ],
  [
    '2020-12',
    () => new Ajv2020({ allErrors: true, strict: false }),
    create2020Validator,
  ],
] as const)('%s', (_dialect, instance, adapterFor) => {
  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ] as const)(
    'validates an async macro when the authored root names only the macro (DETAIL, id=%s, guard first=%s)',
    async (withId, guardFirst) => {
      const ajv = instance();
      ajv.addKeyword({
        keyword: 'remoteOk',
        async: true,
        validate: async (_schema: unknown, value: unknown) =>
          value !== 'taken',
      });
      ajv.addKeyword({
        keyword: 'available',
        macro: () => ({ remoteOk: true }),
      });
      const root = {
        ...(withId ? { $id: 'https://verify.invalid/hidden-async.json' } : {}),
        type: 'object',
        properties: {
          name: { type: 'string', available: true },
          kind: { type: 'string' },
          extra: { type: 'string' },
        },
        if: { properties: { kind: { const: 'x' } }, required: ['kind'] },
        then: { required: ['extra'] },
      } satisfies Parameters<ReturnType<typeof adapterFor>['compile']>[0];
      const adapter = adapterFor(ajv);
      if (guardFirst) {
        const guard = adapter.compileGuard(root, '/if');
        expect([guard({ kind: 'x' }), guard({ kind: 'y' })]).toEqual([
          true,
          false,
        ]);
      }
      const validate = adapter.compile(root);
      expect(await validate({ name: 'taken' })).toMatchObject([
        { keyword: 'remoteOk', dataPath: '/name' },
        { keyword: 'available', dataPath: '/name' },
      ]);
      expect(await validate({ name: 'free' })).toBeNull();
    },
  );
});
