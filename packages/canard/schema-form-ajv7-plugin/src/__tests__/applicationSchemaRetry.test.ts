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
  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ] as const)(
    'retries the same root after missing registration (DETAIL, root id=%s, guard first=%s)',
    async (withId, guardFirst) => {
      const ajv = instance();
      const adapter = adapterFor(ajv, { directGuardCompile: false });
      const id = 'https://app.invalid/late-7.json';
      const dependency = { $ref: id };
      const root = {
        ...(withId
          ? { $id: `https://form.invalid/late-${guardFirst}-7.json` }
          : {}),
        type: 'object',
        properties: { a: dependency, kind: { type: 'string' } },
        if: { properties: { a: dependency }, required: ['a'] },
        then: { required: ['kind'] },
      } satisfies Parameters<typeof adapter.compile>[0];
      const compileGuard = () => adapter.compileGuard(root, '/if');
      const compile = () => adapter.compile(root);
      expect(guardFirst ? compileGuard : compile).toThrow();
      ajv.addSchema({ $id: id, type: 'string', minLength: 2 });
      const guard = guardFirst ? compileGuard() : undefined;
      expect(await compile()({ a: 'x' })).toMatchObject([
        { keyword: 'minLength', dataPath: '/a' },
      ]);
      expect((guard ?? compileGuard())({ a: 'xyz' })).toBe(true);
    },
  );

  it('uses edits to an application schema for new compiles of the same root', async () => {
    const ajv = instance();
    const adapter = adapterFor(ajv, { directGuardCompile: false });
    const id = 'https://app.invalid/mutable.json';
    const applicationSchema = {
      type: 'object',
      properties: { name: { type: 'string', minLength: 2 } },
    };
    ajv.addSchema(applicationSchema, id);

    const reference = { $ref: id };
    const root = { allOf: [reference], if: reference, then: { type: 'object' } };
    const data = { name: 'one' };
    const first = adapter.compile(root);
    const firstGuard = adapter.compileGuard(root, '/if');
    await expect(first(data)).resolves.toBeNull();
    expect(firstGuard(data)).toBe(true);

    applicationSchema.properties.name.minLength = 5;

    await expect(adapter.compile(root)(data)).resolves.toMatchObject([
      { keyword: 'minLength', dataPath: '/name' },
    ]);
    await expect(adapter.compile({ ...root })(data)).resolves.toMatchObject([
      { keyword: 'minLength', dataPath: '/name' },
    ]);
    expect(adapter.compileGuard(root, '/if')(data)).toBe(false);
    await expect(first(data)).resolves.toBeNull();
    expect(firstGuard(data)).toBe(true);
  });

  it('keeps a registration key and a replaced id bound to different schemas', async () => {
    const ajv = instance();
    const adapter = adapterFor(ajv);
    const id = 'https://app.invalid/replaced';
    const alias = 'https://app.invalid/alias';
    ajv.addSchema({ $id: id, type: 'number' }, alias);
    ajv.removeSchema(id);
    ajv.addSchema({ $id: id, type: 'string' });

    expect(ajv.getSchema(alias)?.(4)).toBe(true);
    expect(ajv.getSchema(id)?.('x')).toBe(true);
    await expect(adapter.compile({ $ref: alias })(4)).resolves.toBeNull();
    await expect(adapter.compile({ $ref: id })('x')).resolves.toBeNull();
  });

  it('leaves a removed embedded id absent from later compiles', async () => {
    const ajv = instance();
    const adapter = adapterFor(ajv);
    const embedded = 'https://app.invalid/embedded';
    ajv.addSchema({
      $id: 'https://app.invalid/document',
      definitions: { embedded: { $id: embedded, type: 'string', minLength: 2 } },
    });

    expect(ajv.getSchema(embedded)?.('xy')).toBe(true);
    const compiled = adapter.compile({ $ref: embedded });
    await expect(compiled('x')).resolves.toMatchObject([{ keyword: 'minLength' }]);

    ajv.removeSchema(embedded);
    expect(ajv.getSchema(embedded)).toBeUndefined();
    expect(() => adapter.compile({ $ref: embedded })).toThrow(embedded);
    await expect(compiled('x')).resolves.toMatchObject([{ keyword: 'minLength' }]);
  });
});
