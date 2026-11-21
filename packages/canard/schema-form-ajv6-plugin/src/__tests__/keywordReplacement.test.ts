import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../index';

describe.each([
  ['draft-07', () => new Ajv({ allErrors: true }), createValidator],
] as const)('%s', (_dialect, instance, adapterFor) => {
  it.each(['direct property', 'selected container'] as const)(
    'compiles a changed keyword at a %s and preserves the earlier function (DETAIL I2)',
    async (location) => {
      const ajv = instance();
      const install = (accepted: string) => {
        const validate = (_schema: unknown, value: unknown) =>
          value === accepted;
        ajv.addKeyword('modelRule', { validate });
      };
      install('one');
      const adapter = adapterFor(ajv);
      const leaf = { type: 'string', modelRule: true } as const;
      const schema = {
        type: 'object',
        ...(location === 'selected container'
          ? {
              components: { schemas: { N: leaf } },
              properties: { n: { $ref: '#/components/schemas/N' } },
            }
          : { properties: { n: leaf } }),
      } satisfies Parameters<typeof adapter.compile>[0];
      const first = adapter.compile(schema);
      const data = { n: 'two' };
      const expected = [{ keyword: 'modelRule', dataPath: '/n' }];
      expect(await first(data)).toMatchObject(expected);
      ajv.removeKeyword('modelRule');
      install('two');
      expect(await adapter.compile(schema)(data)).toBeNull();
      expect(await first(data)).toMatchObject(expected);
    },
  );
});
