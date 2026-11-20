import type { JSONSchema } from '@canard/schema-form';
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
    [2, false, false],
    [3, false, true],
    [2, true, true],
    [3, true, false],
  ] as const)(
    'follows %i pointers, imported=%s, by id=%s',
    async (hops, imported, byId) => {
      const ajv = instance();
      const id = 'https://app.invalid/address.json';
      ajv.addSchema({ $id: id, type: 'string', minLength: 3 }, 'app-address');
      const nested: JSONSchema = {
        definitions: { fallback: { type: 'number' } },
        $defs: { fallback: { type: 'number' } },
        components: {
          schemas: [
            { $ref: '#/components/schemas/1' },
            { $ref: '#/components/schemas/2' },
            { $ref: byId ? id : 'app-address' },
          ],
        },
        type: 'object',
        properties: { name: { $ref: `#/components/schemas/${3 - hops}` } },
      };
      if (imported) ajv.addSchema(nested, 'app-container');
      const root: JSONSchema = imported ? { $ref: 'app-container' } : nested;
      const validate = adapterFor(ajv).compile(root);
      expect(await validate({ name: 'yes' })).toBeNull();
      expect(await validate({ name: 'x' })).toMatchObject([
        { keyword: 'minLength', dataPath: '/name' },
      ]);
    },
  );
});
