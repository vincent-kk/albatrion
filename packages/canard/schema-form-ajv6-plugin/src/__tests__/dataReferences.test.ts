import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../index';

describe.each([
  [
    'draft-07',
    () => new Ajv({ allErrors: true, $data: true }),
    createValidator,
  ],
] as const)('%s', (_dialect, instance, adapterFor) => {
  it.each([true, false])(
    'preserves relative data references in validation and guards (DETAIL, direct guard=%s)',
    async (directGuardCompile) => {
      const adapter = adapterFor(instance(), { directGuardCompile });
      const root = {
        type: 'object',
        properties: {
          password: { type: 'string' },
          confirm: { const: { $data: '1/password' } },
          max: { type: 'number' },
          value: { type: 'number', maximum: { $data: '1/max' } },
          nested: {
            type: 'object',
            properties: { copy: { const: { $data: '2/password' } } },
          },
        },
        if: { properties: { confirm: { const: { $data: '1/password' } } } },
        then: { required: ['max'] },
      } satisfies Parameters<typeof adapter.compile>[0];
      const guard = adapter.compileGuard(root, '/if');
      const validate = adapter.compile(root);
      const mismatch = {
        password: 'a',
        confirm: 'b',
        max: 3,
        value: 4,
        nested: { copy: 'c' },
      };
      const match = {
        password: 'a',
        confirm: 'a',
        max: 5,
        value: 4,
        nested: { copy: 'a' },
      };
      const missingMaximum = { password: 'a', confirm: 'a' };
      expect([guard(mismatch), guard(match), guard(missingMaximum)]).toEqual([
        false,
        true,
        true,
      ]);
      expect(await validate(mismatch)).toMatchObject([
        { keyword: 'const', dataPath: '/confirm' },
        { keyword: 'maximum', dataPath: '/value' },
        { keyword: 'const', dataPath: '/nested/copy' },
      ]);
      expect(await validate(match)).toBeNull();
      expect(await validate(missingMaximum)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ keyword: 'required', dataPath: '/max' }),
        ]),
      );
    },
  );
});
