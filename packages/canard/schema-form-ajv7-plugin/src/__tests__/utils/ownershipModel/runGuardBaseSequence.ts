import type { JSONSchema } from '@canard/schema-form';
import { expect } from 'vitest';

import type { ModelApplication, ModelProfile } from './types';

/**
 * Compare one generated pointer guard with its subschema inside native whole-root validation.
 * @param app - Real application receiving exactly the same registration as the twin.
 * @param twin - Oracle application, never used to compile a form.
 * @param profile - Version/dialect construction and direct/context strategy.
 * @param seed - Reproducible independent id/reference/order dimensions.
 * @returns Retained functions and a weak caller root for the collection oracle.
 */
export const runGuardBaseSequence = async <T extends ModelApplication>(
  app: T,
  twin: T,
  profile: ModelProfile<T>,
  seed: number,
): Promise<{ references: WeakRef<object>[]; functions: unknown[] }> => {
  const named = !!(seed & 4),
    relative = !!(seed & 8),
    compileFirst = !!(seed & 16);
  const id = `https://guard-sequence.invalid/folder/root-${seed}`;
  const reference = relative
    ? `external-${seed}`
    : `https://guard-sequence.invalid/external-${seed}`;
  const key = relative && named ? new URL(reference, id).href : reference;
  const external = {
    $id: key,
    ...(profile.version === 6 ? { id: key } : {}),
    type: 'string',
    minLength: 3,
  };
  for (const instance of [app, twin]) instance.addSchema({ ...external }, key);
  const root: JSONSchema = {
    ...(named ? { $id: id, ...(profile.version === 6 ? { id } : {}) } : {}),
    type: 'object',
    properties: { value: { $ref: reference } },
  };
  const oracle = profile.createFresh(twin);
  oracle.addSchema({ ...external }, key);
  const native = oracle.compile(JSON.parse(JSON.stringify(root)));
  const adapter = profile.adapter(app);
  let whole = compileFirst ? adapter.compile(root) : undefined;
  const guard = adapter.compileGuard?.(root, '/properties/value');
  if (!guard) throw new Error('Pointer guard is missing');
  whole ??= adapter.compile(root);
  for (const value of ['', 'xx', 'valid']) {
    const expected = await native({ value });
    const context = `seed=${seed} guard-base named=${named} relative=${relative} compileFirst=${compileFirst} direct=${profile.direct}`;
    expect((await whole({ value })) === null, context).toBe(expected);
    expect(guard(value), context).toBe(expected);
  }
  adapter.release?.(root);
  expect(guard('valid'), `seed=${seed} guard snapshot after release`).toBe(
    true,
  );
  return { references: [profile.observe(root)], functions: [whole, guard] };
};
