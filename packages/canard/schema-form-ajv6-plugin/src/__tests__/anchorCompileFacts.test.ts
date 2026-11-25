import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator as create07 } from '../index';

const dialects = [
  {
    name: 'draft-07',
    make: () => new Ajv({ allErrors: true }),
    create: create07,
    anchor: (name: string) => ({ $id: `#${name}` }),
  },
] as const;

/** A form root without `$id` or `$async` whose target sits in a non-standard container. */
const formOf = (
  anchor: object,
  ref: string,
  format: string,
): Record<string, unknown> => ({
  components: { leaf: { ...anchor, type: 'string', format } },
  $ref: ref,
});

describe.each(dialects)(
  '$name: reference target in a non-standard container',
  (dialect) => {
    it.each([
      ['pointer', '#/components/leaf'],
      ['anchor', '#leaf'],
    ])('reports an asynchronous format reached by %s', async (_kind, ref) => {
      const ajv = dialect.make();
      ajv.addFormat('slow', {
        async: true,
        validate: async (value: string) => value.length > 3,
      });
      const schema = formOf(dialect.anchor('leaf'), ref, 'slow');
      const validate = dialect.create(ajv).compile(schema as any);
      expect(await validate('ab')).toMatchObject([{ keyword: 'format' }]);
      expect(await validate('abcd')).toBeNull();
    });

    it.each([
      ['pointer', '#/components/leaf'],
      ['anchor', '#leaf'],
    ])(
      'uses a format replaced after the first compile when reached by %s',
      async (_kind, ref) => {
        const ajv = dialect.make();
        ajv.addFormat('even', (value: string) => value.length % 2 === 0);
        const schema = formOf(dialect.anchor('leaf'), ref, 'even');
        const validator = dialect.create(ajv);
        expect(await validator.compile(schema as any)('abc')).toMatchObject([
          { keyword: 'format' },
        ]);
        ajv.addFormat('even', (value: string) => value.length % 2 === 1);
        expect(await validator.compile(schema as any)('abc')).toBeNull();
      },
    );
  },
);
