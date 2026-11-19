import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { preparePrivateCompiler } from '../preparePrivateCompiler';

it('preserves native nullable validation when compiler metadata is reused', () => {
  const source = new Ajv({ nullable: true });
  const schema = { type: 'number', nullable: true };
  const owned = preparePrivateCompiler(
    source,
    undefined,
    {},
    'validation',
    false,
  );
  const compiler = owned.instance;
  expect([
    compiler.compile(schema)(null),
    source.compile(schema)(null),
  ]).toEqual([true, true]);
  expect(compiler._opts.nullable).toBe(true);
});

it.each([true, false, undefined])(
  'retains a custom constructor nullable profile %s while reusing its private compiler',
  (nullable) => {
    const observed: (boolean | undefined)[] = [];
    class CustomAjv extends Ajv {
      constructor(options?: Ajv.Options) {
        super(options);
        observed.push(options?.nullable);
      }
    }
    const source = new CustomAjv({ nullable, logger: false });
    const owned = preparePrivateCompiler(
      source,
      undefined,
      {},
      'validation',
      false,
    );
    const compiler = owned.instance;
    expect(
      preparePrivateCompiler(source, owned, {}, 'validation', false).instance,
    ).toBe(compiler);
    expect(observed).toEqual([nullable, false]);
    const schema = { type: 'number', nullable: true };
    const native = source.compile(schema);
    const isolated = compiler.compile(schema);
    expect([isolated(3), isolated(null)]).toEqual([native(3), native(null)]);
    expect(source._opts.nullable).toBe(nullable);
  },
);

it('restores the native nullable profile for typed and untyped schemas on native and subclass instances', () => {
  class ApplicationAjv extends Ajv {}
  for (const Constructor of [Ajv, ApplicationAjv])
    for (const nullable of [true, false])
      for (const typed of [true, false]) {
        const source = new Constructor({ nullable, logger: false });
        const root = { ...(typed ? { type: 'number' } : {}), nullable: true };
        const native = source.compile(JSON.parse(JSON.stringify(root)));
        const first = preparePrivateCompiler(
          source,
          undefined,
          {},
          'validation',
          false,
        );
        const privateValidate = first.instance.compile(
          JSON.parse(JSON.stringify(root)),
        );
        const unchanged = preparePrivateCompiler(
          source,
          first,
          {},
          'validation',
          false,
        );
        expect(unchanged).toBe(first);
        const later = unchanged.instance.compile(
          JSON.parse(JSON.stringify(root)),
        );
        expect(first.instance._opts.nullable).toBe(nullable);
        expect(source._opts.nullable).toBe(nullable);
        for (const value of [null, 3, 'x', false, {}])
          expect([privateValidate(value), later(value)]).toEqual([
            native(value),
            native(value),
          ]);
      }
});
