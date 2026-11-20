import type { JSONSchema } from '@canard/schema-form';
import { expect } from 'vitest';

import { captureApplicationState } from './captureApplicationState';
import { compileOracle } from './compileOracle';
import { outcomeOf } from './outcomeOf';
import type { ModelApplication, ModelProfile } from './types';

/** Fixed graph transitions include the stale-cache, alias and live-extension counterexamples. */
export const runOwnershipFixedSequences = async <T extends ModelApplication>(
  profile: ModelProfile<T>,
  seed: number,
) => {
  const app = profile.create(),
    twin = profile.create();
  const adapter = profile.adapter(app);
  const check = async (root: JSONSchema, data: unknown) => {
    const expected = await compileOracle(twin, profile, root, data);
    const actual = await outcomeOf(() => adapter.compile(root)(data));
    const context = `seed=${seed}: fixed ${JSON.stringify(root)}`;
    if ('error' in expected)
      expect(actual, context).toMatchObject({ error: expected.error });
    else expect(actual, context).toEqual(expected);
    expect(captureApplicationState(app), context).toEqual(
      captureApplicationState(twin),
    );
    return actual;
  };
  const A = 'https://ownership-model.invalid/transitive-A',
    B = 'https://ownership-model.invalid/transitive-B';
  for (const instance of [app, twin]) {
    instance.addSchema({ $id: B, type: 'string', minLength: 3 });
    instance.addSchema({ $id: A, $ref: B });
    instance.getSchema(A);
  }
  await check({ $ref: A }, 'x');
  for (const instance of [app, twin]) instance.removeSchema(B);
  await check({ $ref: A }, 'x');
  for (const instance of [app, twin])
    instance.addSchema({ $id: B, type: 'number' });
  await check({ $ref: A }, 'x');
  const D = 'https://ownership-model.invalid/compound',
    E = 'https://ownership-model.invalid/resource';
  for (const instance of [app, twin])
    instance.addSchema({
      $id: D,
      definitions: { entry: { $id: E, type: 'string', minLength: 3 } },
    });
  await check({ $ref: E }, 'x');
  for (const instance of [app, twin]) instance.removeSchema(E);
  await check({ $ref: E }, 'x');
  await check({ $id: E, type: 'number' }, 3);
  const K = 'https://ownership-model.invalid/keyword';
  for (const instance of [app, twin]) {
    profile.installRule(instance, 1);
    instance.addSchema({
      $id: K,
      type: 'string',
      modelRule: true,
      format: 'model-format',
    });
  }
  const oldRoot: JSONSchema = { $ref: K };
  const before = await check(oldRoot, 'x');
  const old = adapter.compile(oldRoot);
  for (const instance of [app, twin]) profile.installRule(instance, 2);
  await check({ $ref: K }, 'x');
  expect(await outcomeOf(() => old('x'))).toEqual(before);
  for (const instance of [app, twin]) profile.installRule(instance, 0);
  await check({ $ref: K }, 'x');
  for (const instance of [app, twin]) instance.removeSchema(K);
  await check({ $ref: K }, 'x');

  // Keep the same root and omit formats so their fingerprint cannot mask stale rules.
  const keywordOnly: JSONSchema = { type: 'string', modelRule: true };
  for (const instance of [app, twin]) profile.installRule(instance, 1);
  const oldKeywordValidator = adapter.compile(keywordOnly);
  const keywordBefore = await check(keywordOnly, 'x');
  for (const instance of [app, twin]) profile.installRule(instance, 3);
  await check(keywordOnly, 'x');
  expect(adapter.compile(keywordOnly)).not.toBe(oldKeywordValidator);
  expect(await outcomeOf(() => oldKeywordValidator('x'))).toEqual(
    keywordBefore,
  );
  profile.onKeywordReplacement?.();
};
