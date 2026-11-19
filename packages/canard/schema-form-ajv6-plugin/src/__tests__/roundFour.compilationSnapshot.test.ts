import Ajv from 'ajv';
import { expect, it } from 'vitest';
import type { StringSchema } from '@canard/schema-form';
import { createValidator, plugin } from '../index';
it.each(['instance validation', 'instance guard', 'default validation', 'default guard'])('recompiles current contents after $0', async kind => {
  const adapter = kind.startsWith('default') ? plugin.validator : createValidator(new Ajv({ format: false }));
  const schema: StringSchema = { type: 'string', minLength: 2, if: { minLength: 2 } };
  const original = kind.endsWith('guard') ? undefined : adapter.compile(schema);
  if (!original) adapter.compileGuard!(schema, '/if');
  schema.minLength = 1;
  expect(await adapter.compile(schema)('a')).toBeNull();
  if (original) expect(await original('a')).not.toBeNull();
  adapter.release!(schema);
});
