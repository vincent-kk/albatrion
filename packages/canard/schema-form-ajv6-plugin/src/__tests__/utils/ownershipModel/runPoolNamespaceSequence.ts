import type { JSONSchema } from '@canard/schema-form';
import { expect } from 'vitest';

import { captureApplicationState } from './captureApplicationState';
import { compileOracle } from './compileOracle';
import { outcomeOf } from './outcomeOf';
import type { ModelApplication, ModelProfile } from './types';

/**
 * Compare coexisting, released and imported resource namespaces with the current per-reference oracle.
 * @param app - Application whose registries the plugin must leave untouched.
 * @param twin - Independent application receiving only explicit application operations.
 * @param profile - Native dialect and independent reference construction.
 * @param seed - Selects address overlap, release order and imported-resource direction.
 * @returns Snapshot functions and weak caller roots for the collection oracle.
 */
export const runPoolNamespaceSequence = async <T extends ModelApplication>(
  app: T,
  twin: T,
  profile: ModelProfile<T>,
  seed: number,
): Promise<{ references: WeakRef<object>[]; functions: unknown[] }> => {
  const adapter = profile.adapter(app);
  const references: WeakRef<object>[] = [];
  const functions: unknown[] = [];
  const id = `https://pool-sequence.invalid/${seed}`;
  for (let index = 0; index < 4; index++) {
    const address = seed & 1 ? id : `${id}/${index}`;
    const root: JSONSchema = {
      $id: address, ...(profile.version === 6 ? { id: address } : {}),
      type: 'object', properties: { value: { type: 'string', minLength: 1 + index } },
    };
    const expected = await compileOracle(twin, profile, root, { value: 'xx' });
    const validate = adapter.compile(root);
    const context = `seed=${seed} namespace index=${index}`;
    expect(await outcomeOf(() => validate({ value: 'xx' })), context).toEqual(expected);
    const guard = adapter.compileGuard?.(root, '/properties/value');
    expect(guard?.('xx'), context).toBe(index < 2);
    if (seed & 2) adapter.release?.(root);
    expect(await outcomeOf(() => validate({ value: 'xx' })), context).toEqual(expected);
    references.push(profile.observe(root));
    functions.push(validate, guard);
  }
  const imported = { $id: id, ...(profile.version === 6 ? { id } : {}), type: 'string', minLength: 4 };
  for (const instance of [app, twin]) instance.addSchema({ ...imported });
  const linked: JSONSchema = { type: 'object', properties: { value: { $ref: id } } };
  const validate = adapter.compile(linked);
  expect(await validate({ value: 'xx' }), `seed=${seed} imported after form`).not.toBeNull();
  for (const instance of [app, twin]) instance.removeSchema(id);
  const next: JSONSchema = { $id: id, ...(profile.version === 6 ? { id } : {}), type: 'string', minLength: 1 };
  const current = adapter.compile(next);
  expect(await current('xx'), `seed=${seed} form after removed import`).toBeNull();
  expect(await validate({ value: 'xx' }), `seed=${seed} prior import snapshot`).not.toBeNull();
  references.push(profile.observe(linked), profile.observe(next));
  functions.push(validate, current);
  expect(captureApplicationState(app), `seed=${seed} namespace I1`).toEqual(captureApplicationState(twin));
  return { references, functions };
};
