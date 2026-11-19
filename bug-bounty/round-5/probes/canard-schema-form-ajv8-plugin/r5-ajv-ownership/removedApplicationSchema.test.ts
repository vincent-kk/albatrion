import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../default/index';

/** Round 5, hunter r5-ajv-ownership: AJV 8 sibling row (control) of the ajv6 probe of the same name. */
const ID = 'https://r5.invalid/ajv8/removed-by-application';

const formRoot = (): JSONSchema => ({
  $id: ID,
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
});

const verdict = async (validator: ReturnType<typeof createValidator>, root: JSONSchema, data: unknown) => {
  try {
    const issues = await validator.compile(root)(data);
    return issues?.map(({ keyword, dataPath }) => `${keyword} ${dataPath}`) ?? [];
  } catch (error) {
    return `compile threw: ${(error as Error).message}`;
  }
};

describe('ajv8: an application schema removed before a form root with the same $id compiles', () => {
  it('[control] the application removes its schema after unrelated forms and guards compiled', async () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    ajv.addSchema({ $id: ID, type: 'number' });
    const validator = createValidator(ajv);
    expect(await verdict(validator, { type: 'string' }, 'x')).toEqual([]);
    validator.compileGuard({ properties: { a: { if: { $ref: '#/definitions/b' } } }, definitions: { b: { type: 'string' } } } as JSONSchema, '/properties/a/if')('x');
    for (let index = 0; index < 65; index++) await verdict(validator, { type: 'string', title: String(index) }, 'x');
    ajv.removeSchema(ID);
    expect(await verdict(validator, formRoot(), { name: 'ab' })).toEqual(['minLength /name']);
  });
});
