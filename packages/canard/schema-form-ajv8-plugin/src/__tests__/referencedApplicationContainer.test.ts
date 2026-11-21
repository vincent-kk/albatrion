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
    [false, 'external'],
    [true, 'external'],
    [false, 'async'],
    [true, 'async'],
  ] as const)(
    'validates selected reusable schemas with and without a resource id (DETAIL, id=%s, %s)',
    async (withId, variation) => {
      const ajv = instance();
      const address = 'https://verify.invalid/app/address-VERSION.json';
      const validate = async (_schema: unknown, value: unknown) =>
        value !== 'taken';
      ajv.addKeyword({ keyword: 'remoteOk', async: true, validate });
      ajv.addSchema({
        $id: address,
        type: 'object',
        properties: { zip: { type: 'string', minLength: 5 } },
        required: ['zip'],
      });
      const external = variation === 'external';
      const leaf = external ? 'Home' : 'Name';
      const key = external ? 'home' : 'name';
      const root = {
        ...(withId
          ? { $id: `https://verify.invalid/components-${variation}-1.json` }
          : {}),
        type: 'object',
        components: {
          schemas: {
            [leaf]: external
              ? { $ref: address }
              : { type: 'string', remoteOk: true },
          },
        },
        properties: { [key]: { $ref: `#/components/schemas/${leaf}` } },
      } as const;
      const check = adapterFor(ajv).compile(root);
      if (external) {
        expect(await check({ home: { zip: '1' } })).toMatchObject([
          { keyword: 'minLength', dataPath: '/home/zip' },
        ]);
        expect(await check({ home: { zip: '12345' } })).toBeNull();
      } else {
        expect(await check({ name: 'taken' })).toMatchObject([
          { keyword: 'remoteOk', dataPath: '/name' },
        ]);
        expect(await check({ name: 'free' })).toBeNull();
      }
    },
  );
});
