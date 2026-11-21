import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

/**
 * Round 5, hunter r5-ajv-ownership.
 * AJV 6 compiles every form root through one private "pointer" compiler per application instance
 * (round-4 ajv6 item 5 fix). That compiler copies the application's schemas once, when the first
 * form compiles. AJV 7 and 8 register a root with `$id` on the application instance itself.
 * Round 2 pinned that a root fails with "already exists" while the application holds its `$id`;
 * this probe removes the application's registration first, as the round-4 tests do.
 */
const ID = 'https://r5.invalid/ajv6/removed-by-application';

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

describe('ajv6: an application schema removed before a form root with the same $id compiles', () => {
  it('[control] the application removes its schema before any form compiled', async () => {
    const ajv = new Ajv({ allErrors: true });
    ajv.addSchema({ $id: ID, type: 'number' });
    ajv.removeSchema(ID);
    const validator = createValidator(ajv);
    await verdict(validator, { type: 'string' }, 'x');
    expect(await verdict(validator, formRoot(), { name: 'ab' })).toEqual(['minLength /name']);
  });

  it('the application removes its schema after an unrelated form compiled', async () => {
    const ajv = new Ajv({ allErrors: true });
    ajv.addSchema({ $id: ID, type: 'number' });
    const validator = createValidator(ajv);
    expect(await verdict(validator, { type: 'string' }, 'x')).toEqual([]);
    ajv.removeSchema(ID);
    expect(ajv.getSchema(ID)).toBeUndefined();
    expect(await verdict(validator, formRoot(), { name: 'ab' })).toEqual(['minLength /name']);
  });

  it('the same sequence through a second adapter on the same instance', async () => {
    const ajv = new Ajv({ allErrors: true });
    ajv.addSchema({ $id: ID, type: 'number' });
    expect(await verdict(createValidator(ajv), { type: 'string' }, 'x')).toEqual([]);
    ajv.removeSchema(ID);
    expect(await verdict(createValidator(ajv), formRoot(), { name: 'ab' })).toEqual(['minLength /name']);
  });
});
