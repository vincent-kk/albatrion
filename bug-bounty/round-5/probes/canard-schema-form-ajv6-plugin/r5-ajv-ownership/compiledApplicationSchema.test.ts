import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

/**
 * Round 5, hunter r5-ajv-ownership.
 * The application compiles a schema with `ajv.validate(schema, data)` (or `ajv.compile(schema)`),
 * which in AJV 6 stores it in `_refs` and the serialized `_cache`, not in `_schemas`.
 * A form root with equal content and `$id` aliases that cached environment (accepted, round 2).
 * Releasing the form root must leave the application's state as it found it (round-4 ajv6 item 2 fix).
 */
const schema = {
  $id: 'https://r5.invalid/ajv6/compiled-by-application',
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
} satisfies JSONSchema;

/** The engine passes its own deep copy of the authored root to compile and release. */
const engineCopy = (): JSONSchema => JSON.parse(JSON.stringify(schema));

const applicationVerdict = (ajv: Ajv.Ajv, data: unknown) => {
  try {
    return ajv.validate(schema, data);
  } catch (error) {
    return `threw: ${(error as Error).message}`;
  }
};

const formVerdict = async (ajv: Ajv.Ajv, validator: ReturnType<typeof createValidator>, root: JSONSchema) => {
  try {
    const issues = await validator.compile(root)({ name: 'ab' });
    return issues?.map(({ keyword, dataPath }) => `${keyword} ${dataPath}`) ?? [];
  } catch (error) {
    return `compile threw: ${(error as Error).message}`;
  }
};

describe('application schema compiled with ajv.validate(schema, data), then an equal form root', () => {
  it('[control] without a form the application validates its schema object repeatedly', () => {
    const ajv = new Ajv({ allErrors: true });
    expect(applicationVerdict(ajv, { name: 'ab' })).toBe(false);
    expect(applicationVerdict(ajv, { name: 'abc' })).toBe(true);
    expect(applicationVerdict(ajv, { name: 'ab' })).toBe(false);
  });

  it('[control] while the form root is live, both the form and the application validate', async () => {
    const ajv = new Ajv({ allErrors: true });
    expect(applicationVerdict(ajv, { name: 'ab' })).toBe(false);
    const validator = createValidator(ajv);
    const root = engineCopy();
    expect(await formVerdict(ajv, validator, root)).toEqual(['minLength /name']);
    expect(applicationVerdict(ajv, { name: 'abc' })).toBe(true);
  });

  it('after release, the application still validates its own schema object', async () => {
    const ajv = new Ajv({ allErrors: true });
    expect(applicationVerdict(ajv, { name: 'ab' })).toBe(false);
    const validator = createValidator(ajv);
    const root = engineCopy();
    expect(await formVerdict(ajv, validator, root)).toEqual(['minLength /name']);
    validator.release?.(root);
    expect(applicationVerdict(ajv, { name: 'abc' })).toBe(true);
  });

  it('after release, ajv.compile(schema) still returns the application validator', async () => {
    const ajv = new Ajv({ allErrors: true });
    const applicationValidate = ajv.compile(schema);
    const validator = createValidator(ajv);
    const root = engineCopy();
    await formVerdict(ajv, validator, root);
    validator.release?.(root);
    let again: unknown;
    try {
      again = ajv.compile(schema);
    } catch (error) {
      again = `threw: ${(error as Error).message}`;
    }
    expect(again).toBe(applicationValidate);
  });

  it('after release, a later form root with the same schema compiles again (remount after eviction)', async () => {
    const ajv = new Ajv({ allErrors: true });
    expect(applicationVerdict(ajv, { name: 'ab' })).toBe(false);
    const validator = createValidator(ajv);
    const first = engineCopy();
    expect(await formVerdict(ajv, validator, first)).toEqual(['minLength /name']);
    validator.release?.(first);
    expect(await formVerdict(ajv, validator, engineCopy())).toEqual(['minLength /name']);
  });

  it('[control] without the application compile, a later form root with the same schema compiles again', async () => {
    const ajv = new Ajv({ allErrors: true });
    const validator = createValidator(ajv);
    const first = engineCopy();
    expect(await formVerdict(ajv, validator, first)).toEqual(['minLength /name']);
    validator.release?.(first);
    expect(await formVerdict(ajv, validator, engineCopy())).toEqual(['minLength /name']);
  });

  it('[diagnostic] the pre-fix release (removeSchema(key) then removeSchema(copy)) left ajv.validate(schema, data) working', async () => {
    // Emulates disposeSchemaRoot before 2e4061359 on the same registration: removeSchema(key), removeSchema(validationCopy).
    const ajv = new Ajv({ allErrors: true });
    expect(applicationVerdict(ajv, { name: 'ab' })).toBe(false);
    const validator = createValidator(ajv);
    const root = engineCopy();
    await formVerdict(ajv, validator, root);
    const key = Object.keys(ajv._schemas).find((name) => name.startsWith('urn:canard:schema-form:ajv6:'));
    expect(key).toBeDefined();
    ajv.removeSchema(key as string);
    ajv.removeSchema(engineCopy());
    expect(applicationVerdict(ajv, { name: 'abc' })).toBe(true);
    expect(applicationVerdict(ajv, { name: 'ab' })).toBe(false);
  });
});
