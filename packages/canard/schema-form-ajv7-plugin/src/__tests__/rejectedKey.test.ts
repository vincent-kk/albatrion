import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

it('decodes the authored token for a negative requirement', async () => {
  const name = '이름 %/~';
  const validate = createValidator(new Ajv({ strict: false })).compile({
    properties: { [name]: { not: { required: ['blocked'] } } },
  });
  await expect(validate({ [name]: { blocked: true } })).resolves.toMatchObject([
    { keyword: 'not', dataPath: '/이름 %~1~0', rejectedKey: 'blocked' },
  ]);
});

it.each([
  [
    { properties: { value: { dependentSchemas: { items: false } } } },
    { value: { items: true } },
    '/value',
  ],
  [
    { properties: { a: { type: 'array', contains: false } } },
    { a: [1] },
    '/a/0',
  ],
] as const)(
  'keeps a value-level false at its evaluated location for %j',
  async (schema, value, dataPath) => {
    const validate = createValidator(
      new Ajv2019({ strict: false, allErrors: true }),
    ).compile(schema);
    const issues = await validate(value);
    const issue = issues?.find(({ keyword }) => keyword === 'false schema');

    expect(issue).toMatchObject({ dataPath });
    expect(issue?.rejectedKey).toBeUndefined();
  },
);
