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
    () => new Ajv({ allErrors: true, strict: false, $data: true }),
    createValidator,
  ],
  [
    '2019-09',
    () => new Ajv2019({ allErrors: true, strict: false, $data: true }),
    create2019Validator,
  ],
  [
    '2020-12',
    () => new Ajv2020({ allErrors: true, strict: false, $data: true }),
    create2020Validator,
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
