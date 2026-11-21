import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../default/index';

/**
 * Round 5, hunter r5-ajv-ownership (angle LC4), measurement.
 * `registerSchemaRoot.ts` caps the roots without `$id` compiled on the application instance at 64
 * per registry ("Ajv's code scope keeps functions after removeSchema"), then rotates to a sibling.
 * The counter lives in each adapter's registry, so a route that memoizes `createValidator(ajv)`
 * starts again at 0 on every mount and compiles on the application instance every time.
 */
const scopeEntries = (ajv: Ajv) =>
  Object.values((ajv.scope as unknown as { _values: Record<string, Map<unknown, unknown>> })._values).reduce(
    (count, values) => count + values.size,
    0,
  );

const schema: JSONSchema = {
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
};

describe('ajv8: compiled code the application instance retains across form mounts', () => {
  it('[measurement] 200 mounts with one long-lived adapter compile at most 64 roots on the instance', async () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const before = scopeEntries(ajv);
    const validator = createValidator(ajv);
    for (let index = 0; index < 200; index++)
      await validator.compile(JSON.parse(JSON.stringify(schema)))({ name: 'ab' });
    const growth = scopeEntries(ajv) - before;
    expect(growth).toBeLessThanOrEqual(64 * 3);
  });

  it('200 mounts that each memoize their own adapter grow the instance no more than one long-lived adapter', async () => {
    const shared = new Ajv({ allErrors: true, strict: false });
    const sharedBefore = scopeEntries(shared);
    const longLived = createValidator(shared);
    for (let index = 0; index < 200; index++)
      await longLived.compile(JSON.parse(JSON.stringify(schema)))({ name: 'ab' });
    const longLivedGrowth = scopeEntries(shared) - sharedBefore;

    const ajv = new Ajv({ allErrors: true, strict: false });
    const before = scopeEntries(ajv);
    for (let index = 0; index < 200; index++) {
      const perMount = createValidator(ajv);
      await perMount.compile(JSON.parse(JSON.stringify(schema)))({ name: 'ab' });
    }
    const perMountGrowth = scopeEntries(ajv) - before;
    expect({ perMountGrowth }).toEqual({ perMountGrowth: longLivedGrowth });
  });
});
