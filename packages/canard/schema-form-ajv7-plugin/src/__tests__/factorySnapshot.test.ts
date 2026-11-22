import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import { assert, describe, expect, it } from 'vitest';

import { createValidatorFactory } from '../index';

describe.each([
  ['Draft-07', Ajv],
  ['Draft-2019-09', Ajv2019],
] as const)('%s standalone factory', (_draft, Constructor) => {
  const key = 'https://app.example/alias';

  it('compiles a registered key without populating the app cache', async () => {
    const ajv = new Constructor();
    ajv.addSchema({ type: 'string' }, key);
    const entry = ajv.schemas[key];
    assert(entry, 'Expected the application schema registration');
    expect(entry.validate).toBeUndefined();

    const validate = createValidatorFactory(ajv, key)({});

    expect(entry.validate).toBeUndefined();
    await expect(validate('x')).resolves.toBeNull();
  });

  it('compiles a keyed document fragment with the current keyword definition', async () => {
    const ajv = new Constructor({ strict: false });
    const document = 'https://app.example/document';
    ajv.addKeyword({
      keyword: 'fieldRule',
      compile: () => (value: unknown) => value === 'old',
    });
    ajv.addSchema({
      $id: document,
      components: { value: { fieldRule: true } },
    });
    const compile = createValidatorFactory(
      ajv,
      document + '#/components/value',
    );
    const previous = compile({});

    ajv.removeKeyword('fieldRule');
    ajv.addKeyword({
      keyword: 'fieldRule',
      compile: () => (value: unknown) => value === 'new',
    });

    await expect(previous('new')).resolves.toMatchObject([
      { keyword: 'fieldRule' },
    ]);
    await expect(compile({})('new')).resolves.toBeNull();
  });

  it('keeps the rejected key from the compiled schema after the app edits it', async () => {
    const ajv = new Constructor({ strict: false });
    const schema = { not: { required: ['old'] } };
    ajv.addSchema(schema, key);
    const compile = createValidatorFactory(ajv, key);
    const previous = compile({});
    const oldIssue = [{ keyword: 'not', rejectedKey: 'old' }];
    await expect(previous({ old: 1 })).resolves.toMatchObject(oldIssue);

    schema.not.required[0] = 'new';

    await expect(previous({ old: 1 })).resolves.toMatchObject(oldIssue);
  });

  it('refuses a mutating instance at factory creation', () => {
    expect(() =>
      createValidatorFactory(new Constructor({ coerceTypes: true })),
    ).toThrow(expect.objectContaining({ name: 'ValidatorBindRefusedError' }));
  });

  it('refuses to compile a keyed validator after coercion is enabled', () => {
    const ajv = new Constructor({ strict: false });
    ajv.addSchema({ properties: { field: { type: 'number' } } }, key);
    const compile = createValidatorFactory(ajv, key);
    ajv.opts.coerceTypes = true;

    expect(() => compile({})).toThrow(
      expect.objectContaining({ name: 'ValidatorBindRefusedError' }),
    );
  });
});
