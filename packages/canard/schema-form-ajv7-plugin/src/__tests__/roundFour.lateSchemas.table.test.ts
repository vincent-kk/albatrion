import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

it.each([1, 65, 130])(
  'resolves late application schemas like an unrotated compiler after %s roots',
  async (earlierRoots) => {
    const instance = new Ajv({ allErrors: true, strict: false });
    const validator = createValidator(instance);
    for (let index = 0; index < earlierRoots; index++)
      validator.compile({ type: 'string', title: String(index) });
    instance.addSchema({
      $id: 'https://round-four.invalid/late',
      definitions: { code: { type: 'string', pattern: '^[A-Z]+$' } },
    });
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        code: { $ref: 'https://round-four.invalid/late#/definitions/code' },
      },
    };
    const fresh = createValidator(instance);
    const expected = await fresh.compile(schema)({ code: 'abc' });
    const actual = await validator.compile({ ...schema })({ code: 'abc' });
    expect(actual).toEqual(expected);
    expect(actual?.map(({ keyword }) => keyword)).toEqual(['pattern']);
  },
);

it('resolves a late schema from a root guard clone like a newly created guard clone', () => {
  const instance = new Ajv({ allErrors: true, strict: false });
  const validator = createValidator(instance);
  const root: JSONSchema = {
    type: 'object',
    properties: {
      first: { if: { const: 'x' } },
      second: {
        if: { $ref: 'https://round-four.invalid/late-guard#/definitions/code' },
      },
    },
  };
  validator.compileGuard!(root, '/properties/first/if')('x');
  instance.addSchema({
    $id: 'https://round-four.invalid/late-guard',
    definitions: { code: { type: 'string', pattern: '^[A-Z]+$' } },
  });
  const fresh = createValidator(instance).compileGuard!(
    root,
    '/properties/second/if',
  );
  const later = validator.compileGuard!(root, '/properties/second/if');
  for (const value of ['AB', 'ab', 3, null])
    expect(later(value)).toBe(fresh(value));
  expect(later('AB')).toBe(true);
  expect(later('ab')).toBe(false);
});

/**
 * @param earlierRoots - Compiles before the application registers an asynchronous definition.
 * @returns The asynchronous keyword issues from a later form using that definition.
 */
const lateAsyncVerdict = async (earlierRoots: number) => {
  const instance = new Ajv({ allErrors: true, strict: false });
  const definition = {
    async: true,
    validate: (_schema: boolean, value: string) =>
      Promise.resolve(value !== 'taken'),
  };
  instance.addKeyword({ keyword: 'availableName', ...definition });
  const validator = createValidator(instance);
  for (let index = 0; index < earlierRoots; index++)
    validator.compile({ type: 'string', title: String(index) });
  const id = 'https://round-four.invalid/late-async';
  instance.addSchema(
    { $id: id, type: 'string', availableName: true },
    'late-async-alias',
  );
  const schema: JSONSchema = {
    $async: true,
    type: 'object',
    properties: { name: { $ref: id } },
  };
  const issues = await validator.compile(schema)({ name: 'taken' });
  return issues?.map(({ keyword, dataPath }) => [keyword, dataPath]);
};

it('late asynchronous definitions agree with definitions present before any compiler was created', async () => {
  const expected = await lateAsyncVerdict(0);
  expect(expected).toEqual([['availableName', '/name']]);
  expect(await lateAsyncVerdict(65)).toEqual(expected);
});

it.each([true, false])(
  'late boolean schema %s agrees with a fresh compiler',
  async (definition) => {
    const instance = new Ajv({ allErrors: true, strict: false });
    const validator = createValidator(instance);
    for (let index = 0; index < 65; index++)
      validator.compile({ type: 'string', title: String(index) });
    const id = 'https://round-four.invalid/late-boolean';
    instance.addSchema(definition, id);
    const schema: JSONSchema = {
      type: 'object',
      properties: { name: { $ref: id } },
    };
    const expected = await createValidator(instance).compile(schema)({
      name: 'x',
    });
    const actual = await validator.compile({ ...schema })({ name: 'x' });
    expect(actual).toEqual(expected);
    expect(actual === null).toBe(definition);
  },
);
