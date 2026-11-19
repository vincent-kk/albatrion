import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

it.each([
  { identified: false, explicitAsync: false },
  { identified: true, explicitAsync: false },
  { identified: false, explicitAsync: true },
  { identified: true, explicitAsync: true },
])(
  'async keywords agree with explicit async schemas: id=$identified async=$explicitAsync',
  async ({ identified, explicitAsync }) => {
    const instance = new Ajv({ allErrors: true });
    const definition = {
      async: true,
      validate: (_schema: boolean, value: string) =>
        Promise.resolve(value !== 'taken'),
    };
    instance.addKeyword('availableName', definition);
    const validator = createValidator(instance);
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', availableName: true },
        forbidden: { type: 'string' },
      },
      not: { required: ['blocked'] },
      ...(identified
        ? { $id: 'https://round-four.invalid/async-keyword' }
        : {}),
      ...(explicitAsync ? { $async: true } : {}),
    };
    const explicit: JSONSchema = {
      ...schema,
      $id: 'https://round-four.invalid/explicit-keyword',
      $async: true,
    };
    const validate = validator.compile(schema);
    const control = validator.compile(explicit);
    for (const value of [
      { name: 'taken' },
      { name: 'available' },
      { name: 'available', forbidden: 1 },
      { name: 'available', blocked: 1 },
    ]) {
      const actual = await validate(value);
      const expected = await control(value);
      const normalized = (actual ?? []).map(
        ({ keyword, dataPath, rejectedKey }) => ({
          keyword,
          dataPath,
          rejectedKey,
        }),
      );
      expect(normalized).toEqual(
        (expected ?? []).map(({ keyword, dataPath, rejectedKey }) => ({
          keyword,
          dataPath,
          rejectedKey,
        })),
      );
    }
    expect(
      (await validate({ name: 'taken' }))?.map(({ keyword, dataPath }) => [
        keyword,
        dataPath,
      ]),
    ).toEqual([['availableName', '/name']]);
  },
);
