import type { JSONSchema } from '@canard/schema-form';
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
  it.each([false, true])(
    'tracks a macro pointer with guard first=%s',
    async (guardFirst) => {
      const ajv = instance();
      ajv.addKeyword({
        keyword: 'expand',
        macro: () => ({ $ref: '#/components/name' }),
      });
      ajv.addFormat('macro-format', /^first$/);
      const schema: JSONSchema = {
        type: 'object',
        definitions: { spare: { type: 'number' } },
        $defs: { spare: { type: 'string' } },
        components: {
          name: { type: 'string', format: 'macro-format' },
          unused: { $ref: 'unregistered-document' },
          guard: { required: ['flag'] },
        },
        properties: {
          name: { expand: true },
          count: { $ref: '#/definitions/spare' },
          tag: { $ref: '#/$defs/spare' },
        },
        if: { $ref: '#/components/guard' },
        then: { required: ['name'] },
      };
      const adapter = adapterFor(ajv);
      const checkGuard = () => {
        const guard = adapter.compileGuard(schema, '/if');
        expect(guard({ flag: true })).toBe(true);
        expect(guard({})).toBe(false);
      };
      if (guardFirst) checkGuard();
      const before = adapter.compile(schema);
      if (!guardFirst) checkGuard();
      const data = { name: 'second', count: 1, tag: 'x' };
      expect(await before(data)).toMatchObject([
        { keyword: 'format' },
        { keyword: 'expand' },
      ]);
      ajv.addFormat('macro-format', /^second$/);
      expect(await adapter.compile(schema)(data)).toBeNull();
      expect(await before(data)).toMatchObject([
        { keyword: 'format' },
        { keyword: 'expand' },
      ]);
    },
  );

  it('imports the dependencies of a selected application fragment', async () => {
    const ajv = instance();
    const uri = 'https://app.invalid/fragment-owner.json';
    ajv.addSchema(
      { type: 'string', minLength: 3 },
      'https://app.invalid/fragment-target.json',
    );
    ajv.addSchema({
      $id: uri,
      type: 'object',
      components: {
        live: { $ref: 'https://app.invalid/fragment-target.json' },
        unused: { $ref: 'unknown-target' },
      },
    });
    const actual = adapterFor(ajv).compile({ $ref: `${uri}#/components/live` });
    expect(await actual('x')).toMatchObject([{ keyword: 'minLength' }]);
    expect(await actual('yes')).toBeNull();
  });
});
