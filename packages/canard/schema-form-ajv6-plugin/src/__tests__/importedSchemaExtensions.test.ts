import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../index';

describe.each([
  ['draft-07', () => new Ajv({ allErrors: true }), createValidator],
] as const)('%s', (_dialect, instance, adapterFor) => {
  it('collects an async rule from a selected fragment of an already imported document (DETAIL)', async () => {
    const ajv = instance();
    ajv.addKeyword('remote', { async: true, validate: async () => false });
    const id = 'https://review.invalid/doc';
    ajv.addSchema({
      $id: id,
      type: 'object',
      components: { x: { type: 'string', remote: true } },
    });
    const adapter = adapterFor(ajv);
    expect(await adapter.compile({ $ref: id })({})).toBeNull();
    const validate = adapter.compile({ $ref: `${id}#/components/x` });
    expect(await validate('x')).toMatchObject([{ keyword: 'remote' }]);
  });

  it.each([
    ['sf', /^ok$/],
    ['af', { async: true, validate: async (value: string) => value === 'ok' }],
  ] as const)(
    'validates the document selected by a chain of imported pointers using format %s as a local or imported document (DETAIL)',
    async (format, definition) => {
      const ajv = instance();
      ajv.addFormat(format, definition);
      const document = {
        type: 'object',
        definitions: { n: { type: 'number' } },
        $defs: { s: { type: 'string' } },
        components: {
          a: { $ref: '#/components/b' },
          b: { $ref: '#/components/c' },
          c: { type: 'string', format },
          g: { required: ['flag'] },
        },
        properties: {
          value: { $ref: '#/components/a' },
          num: { $ref: '#/definitions/n' },
          str: { $ref: '#/$defs/s' },
        },
        if: { required: ['flag'] },
      } satisfies Parameters<ReturnType<typeof adapterFor>['compile']>[0];
      const adapter = adapterFor(ajv);
      const direct = adapter.compileGuard(document, '/if');
      expect(direct({ flag: 1 })).toBe(true);
      const local = adapter.compile(document);
      expect(direct({})).toBe(false);
      ajv.addSchema(document, 'container');
      const root = { $ref: 'container' };
      const candidate = { value: 'x', num: 1, str: 's', selector: 'af' };
      const first = adapterFor(ajv).compile(root);
      const second = adapterFor(ajv).compile(root);
      for (const validate of [local, first, second]) {
        expect(await validate(candidate)).toMatchObject([
          { keyword: 'format', dataPath: '/value' },
        ]);
        expect(await validate({ ...candidate, value: 'ok' })).toBeNull();
      }
    },
  );
});
