import { expect } from 'vitest';

import { makeDocument } from '../applicationRootCollection/makeDocument';
import { captureApplicationState } from './captureApplicationState';
import { compileOracle } from './compileOracle';
import { outcomeOf } from './outcomeOf';
import type { ModelApplication, ModelProfile } from './types';

/**
 * Drive application/form-shared documents across registration order and snapshot boundaries.
 * @param app - Real application kept alive by the outer sequence during collection.
 * @param twin - Application-only oracle kept alive for the same collection comparison.
 * @param profile - Native dialect, adapter/factory creation and weak observation support.
 * @param seed - Chooses shared root/descendant, application-before/after and compiler entry.
 * @returns Weak original identities and retained snapshot functions, never raw schemas.
 */
export const runSharedIdentitySequence = async <T extends ModelApplication>(
  app: T,
  twin: T,
  profile: ModelProfile<T>,
  seed: number,
) => {
  const child = !!(seed & 1),
    after = !!(seed & 2);
  const key = `https://shared-sequence.invalid/${seed}`;
  const actual = makeDocument(child, key),
    oracle = makeDocument(child, key);
  const adapter = profile.adapter(app);
  const compile =
    seed & 0x200 && profile.factory ? profile.factory(app) : adapter.compile;
  const functions: unknown[] = [];
  if (after) {
    const field = child ? 'value' : 'next';
    const properties = actual.root.properties,
      oracleProperties = oracle.root.properties;
    if (!properties || !oracleProperties)
      throw new Error('Shared fixture properties are missing');
    const reference = properties[field],
      oracleReference = oracleProperties[field];
    if (reference === undefined || oracleReference === undefined)
      throw new Error('Shared fixture reference is missing');
    delete properties[field];
    delete oracleProperties[field];
    const before = compile(actual.root);
    expect(
      await before(actual.invalid),
      `seed=${seed} initial snapshot`,
    ).toBeNull();
    properties[field] = reference;
    oracleProperties[field] = oracleReference;
    functions.push(before);
  }
  for (const [instance, resource] of [
    [app, actual.resource],
    [twin, oracle.resource],
  ] satisfies [T, typeof actual.resource][])
    instance.addSchema(resource, key);
  const validate = compile(actual.root);
  expect(
    await outcomeOf(() => validate(actual.valid)),
    `seed=${seed} shared valid`,
  ).toEqual(await compileOracle(twin, profile, actual.root, actual.valid));
  expect(
    await outcomeOf(() => validate(actual.invalid)),
    `seed=${seed} shared invalid`,
  ).toEqual(await compileOracle(twin, profile, actual.root, actual.invalid));
  const guard = adapter.compileGuard?.(actual.root, actual.pointer);
  if (!guard) throw new Error('Shared fixture guard is missing');
  expect(guard(actual.guardValid), `seed=${seed} shared guard valid`).toBe(
    true,
  );
  expect(guard(actual.guardInvalid), `seed=${seed} shared guard invalid`).toBe(
    false,
  );
  app.removeSchema();
  twin.removeSchema();
  expect(
    await validate(actual.valid),
    `seed=${seed} removed resource snapshot`,
  ).toBeNull();
  expect(guard(actual.guardValid), `seed=${seed} removed guard snapshot`).toBe(
    true,
  );
  expect(captureApplicationState(app), `seed=${seed} shared I1`).toEqual(
    captureApplicationState(twin),
  );
  functions.push(validate, guard);
  return {
    actual: [profile.observe(actual.root), profile.observe(actual.resource)],
    oracle: [profile.observe(oracle.root), profile.observe(oracle.resource)],
    functions,
  };
};
