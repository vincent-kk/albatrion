import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

const id = 'https://example.test/item';
const item = {
  type: 'object',
  properties: { named: { type: 'object', not: { required: ['x'] } } },
} as const;

it.each([
  ['default', 'items'],
  ['enum', 'properties'],
] as const)(
  'resolves an identified resource declared by the field %s without retargeting a value-level false issue',
  async (field, valueKey) => {
    const schema: JSONSchema = {
      properties: {
        [field]: {
          ...item,
          $id: id,
          properties: {
            ...item.properties,
            [valueKey]: { type: 'array', if: { minItems: 1 }, then: false },
          },
        },
        used: { $ref: id },
      },
    };
    const validate = createValidator(new Ajv({ allErrors: true })).compile(
      schema,
    );
    const issues = await validate({
      used: { [valueKey]: [1], named: { x: 1 } },
    });
    const falseIssue = issues?.find(
      ({ keyword }) => keyword === 'false schema',
    );
    expect(falseIssue).toMatchObject({ dataPath: '/used/' + valueKey });
    expect(falseIssue?.rejectedKey).toBeUndefined();
    expect(issues?.find(({ keyword }) => keyword === 'not')).toMatchObject({
      schemaPath: id + '/properties/named/not',
      dataPath: '/used/named',
      rejectedKey: 'x',
    });
  },
);

it.each(['auto', 'id', '$id'] as const)(
  'resolves identified resources using the configured schemaId %s',
  async (schemaId) => {
    const idKey = schemaId === '$id' ? '$id' : 'id';
    const schema: JSONSchema = {
      definitions: { item: { ...item, [idKey]: id } },
      properties: { used: { $ref: id } },
    };
    const validate = createValidator(new Ajv({ schemaId })).compile(schema);
    await expect(
      validate({ used: { named: { x: 1 } } }),
    ).resolves.toMatchObject([
      { keyword: 'not', dataPath: '/used/named', rejectedKey: 'x' },
    ]);
  },
);

it.each(['const', 'enum', 'examples', 'default'] as const)(
  'does not treat an id inside %s data as a schema address',
  async (keyword) => {
    const annotation = { $id: id + '/properties' };
    const schema: JSONSchema = {
      definitions: { item: { ...item, $id: id } },
      properties: {
        used: { $ref: id },
        note: {
          [keyword]:
            keyword === 'enum' || keyword === 'examples'
              ? [annotation]
              : annotation,
        },
      },
    };
    const validate = createValidator(new Ajv()).compile(schema);
    await expect(
      validate({ used: { named: { x: 1 } } }),
    ).resolves.toMatchObject([
      { keyword: 'not', dataPath: '/used/named', rejectedKey: 'x' },
    ]);
  },
);

it('reports the compiled rejected key under a URI-encoded property after an authored edit', async () => {
  const key = '이름 %/~';
  const required = ['old'];
  const schema = { properties: { [key]: { not: { required } } } };
  const validate = createValidator(new Ajv()).compile(schema);

  required[0] = 'new';

  await expect(validate({ [key]: { old: true } })).resolves.toMatchObject([
    { keyword: 'not', dataPath: '/이름 %~1~0', rejectedKey: 'old' },
  ]);
});

it('keeps a contains: false issue at its array item', async () => {
  const validate = createValidator(new Ajv({ allErrors: true })).compile({
    properties: { a: { type: 'array', contains: false } },
  });
  const issues = await validate({ a: [1] });
  const issue = issues?.find(({ keyword }) => keyword === 'false schema');
  expect(issue).toMatchObject({ dataPath: '/a/0' });
  expect(issue?.rejectedKey).toBeUndefined();
});
