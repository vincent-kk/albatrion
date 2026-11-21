import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../default/index';

/** Count native generated-code entries without depending on a declaration for the private scope. */
const scopeSize = (instance: Ajv): number =>
  Object.values(Reflect.get(instance.scope, '_values')).reduce<number>(
    (count, entries) => count + (entries instanceof Map ? entries.size : 0),
    0,
  );

it('round-5 ajv8 5: per-mount adapters retain no more application code than a shared adapter', async () => {
  const growth = [];
  for (const perMount of [false, true]) {
    const instance = new Ajv({ allErrors: true, strict: false });
    const before = scopeSize(instance);
    const shared = createValidator(instance);
    for (let index = 0; index < 200; index++) {
      const adapter = perMount ? createValidator(instance) : shared;
      const schema: JSONSchema = {
        type: 'object',
        properties: { name: { type: 'string', minLength: 3 } },
      };
      await adapter.compile(schema)({ name: 'ab' });
    }
    growth.push(scopeSize(instance) - before);
  }
  expect(growth[1]).toBeLessThanOrEqual(growth[0]);
});
