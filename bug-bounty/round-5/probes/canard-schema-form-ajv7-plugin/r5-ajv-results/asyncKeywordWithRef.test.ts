/**
 * r5-ajv-results: an asynchronous keyword or format in a root with `$id` that also contains a `$ref`.
 * Imports the plugin source (`../../index`) and the AJV 7.2.4 copy the plugin resolves.
 */
import AjvModule from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

const Ajv = ((AjvModule as unknown as { default?: unknown }).default ?? AjvModule) as new (
  options: object,
) => {
  addKeyword(definition: object): void;
  addFormat(name: string, definition: object): void;
  compile(schema: object): (data: unknown) => unknown;
};

const createInstance = () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  ajv.addKeyword({
    keyword: 'available',
    async: true,
    validate: async (_schema: unknown, data: unknown) => data !== 'taken',
  });
  return ajv;
};

let sequence = 0;
const idOf = (withId: boolean) =>
  withId ? { $id: `https://example.com/r5-ajv7-ref-${++sequence}.json` } : {};
const shapes = {
  'an unrelated local $ref': (withId: boolean) => ({
    ...idOf(withId),
    type: 'object',
    definitions: { text: { type: 'string' } },
    properties: {
      name: { type: 'string', minLength: 3, available: true },
      note: { $ref: '#/definitions/text' },
    },
  }),
  'a $ref to the definition that holds the keyword': (withId: boolean) => ({
    ...idOf(withId),
    type: 'object',
    definitions: { user: { type: 'string', minLength: 3, available: true } },
    properties: { name: { $ref: '#/definitions/user' } },
  }),
  'a recursive $ref to the root': (withId: boolean) => ({
    ...idOf(withId),
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 3, available: true },
      child: { $ref: '#' },
    },
  }),
};

const run = async (schema: object) => {
  try {
    const validate = createValidator(createInstance() as never).compile(schema as never);
    const issues = (await validate({ name: 'taken' })) as
      | { keyword?: string; dataPath: string }[]
      | null;
    return issues === null ? [] : issues.map((issue) => `${issue.keyword} ${issue.dataPath}`);
  } catch (error) {
    return `threw: ${(error as Error).message}`;
  }
};

describe('ajv7: asynchronous keyword in a root with $id and a $ref', () => {
  for (const [label, shape] of Object.entries(shapes)) {
    it(`a root with $id and ${label} reports the keyword issue`, async () => {
      expect(await run(shape(true))).toEqual(['available /name']);
    });

    it(`[control] the same root without $id and with ${label} reports the keyword issue`, async () => {
      expect(await run(shape(false))).toEqual(['available /name']);
    });
  }

  it('[control] a root with $id and no $ref reports the keyword issue', async () => {
    expect(
      await run({
        ...idOf(true),
        type: 'object',
        properties: { name: { type: 'string', minLength: 3, available: true } },
      }),
    ).toEqual(['available /name']);
  });

  it('[control] plain AJV 7 validates the same root with $id and a $ref once $async is declared', async () => {
    const validate = createInstance().compile({
      ...shapes['an unrelated local $ref'](true),
      $async: true,
    }) as (data: unknown) => Promise<unknown>;
    const result = await validate({ name: 'taken' }).then(
      () => 'valid',
      (error: { errors?: { keyword: string; dataPath: string }[] }) =>
        error.errors?.map((entry) => `${entry.keyword} ${entry.dataPath}`),
    );
    expect(result).toEqual(['available /name']);
  });
});
