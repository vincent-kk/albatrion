import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../index';

describe.each([
  ['draft-07', () => new Ajv({ allErrors: true }), createValidator],
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
      ajv.addKeyword('remoteOk', { async: true, validate });
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
