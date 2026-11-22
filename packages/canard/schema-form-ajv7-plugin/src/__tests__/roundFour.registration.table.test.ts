import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

it.each([{ replacement: 'same' }, { replacement: 'different' }])(
  'release preserves a subsequent application registration: $replacement',
  async ({ replacement }) => {
    const instance = new Ajv({ allErrors: true, strict: false });
    const schema = {
      $id: 'https://round-four.invalid/ownership',
      type: 'string',
      minLength: 3,
    } satisfies JSONSchema;
    const validator = createValidator(instance);
    const validate = validator.compile(schema);
    expect(await validate('x')).not.toBeNull();
    instance.removeSchema(schema.$id);
    const applicationSchema =
      replacement === 'same'
        ? { ...schema }
        : { $id: schema.$id, type: 'number' };
    instance.addSchema(applicationSchema);
    const before = instance.getSchema(schema.$id);
    if (!before)
      throw new Error('Application registration is missing before release');
    const serialized = [before('x'), before(7)];
    validator.release?.(schema);
    const retained = instance.getSchema(schema.$id);
    expect(retained).toBe(before);
    expect([retained?.('x'), retained?.(7)]).toEqual(serialized);
  },
);
