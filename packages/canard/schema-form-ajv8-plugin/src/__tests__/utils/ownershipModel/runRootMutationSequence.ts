import type { JSONSchema } from '@canard/schema-form';
import { expect } from 'vitest';
import { compileOracle } from './compileOracle';
import { outcomeOf } from './outcomeOf';
import type { ModelApplication, ModelProfile } from './types';

/** Change caller contents without release, comparing new compilation with old immutable functions. */
export const runRootMutationSequence = async <T extends ModelApplication>(source: T, twin: T, profile: ModelProfile<T>, seed: number) => {
  const adapter = profile.adapter(source);
  const references: WeakRef<object>[] = [];
  const functions: unknown[] = [];
  for (const named of [false, true]) for (const entry of ['validation', 'guard']) {
    const options = Reflect.get(source, '_opts');
    const idKey = profile.version === 6 && options && typeof options === 'object' && Reflect.get(options, 'schemaId') === 'id' ? 'id' : '$id';
    const root: JSONSchema = { type: 'string', minLength: 2, then: { maxLength: 10 }, if: { type: 'string', minLength: 2 } };
    if (named) Reflect.set(root, idKey, `https://mutation-model.invalid/${seed}/${entry}`);
    const context = `seed=${seed}: in-place ${entry}, named=${named}`;
    const oldValidate = entry === 'validation' ? adapter.compile(root) : undefined;
    const oldGuard = entry === 'guard' ? adapter.compileGuard?.(root, '/if') : undefined;
    const before = oldValidate ? await outcomeOf(() => oldValidate('x')) : undefined;
    if (oldGuard) expect(oldGuard('x'), context).toBe(false);
    root.minLength = 1;
    root.if = { type: 'string', minLength: 1 };
    const current = adapter.compile(root);
    expect(await outcomeOf(() => current('x')), context).toEqual(await compileOracle(twin, profile, root, 'x'));
    const currentGuard = adapter.compileGuard?.(root, '/if');
    expect(currentGuard?.('x'), context).toBe(true);
    if (oldValidate) expect(await outcomeOf(() => oldValidate('x')), context).toEqual(before);
    if (oldGuard) expect(oldGuard('x'), context).toBe(false);
    functions.push(oldValidate, oldGuard, current, currentGuard);
    references.push(profile.observe(root));
    adapter.release?.(root);
  }
  return { references, functions };
};
