import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';

import { createValidator } from '../../index';

const KEY = Symbol.for('@canard/schema-form-ajv6-plugin/registrations/v2');

/** Live (non-released, still reachable) registrations held by the instance ledger. */
const liveRegistrations = (ajv: Ajv): number => {
  const ledger = Reflect.get(globalThis, KEY).get(ajv);
  return ledger.active.filter((slot: WeakRef<{ released: boolean }>) => {
    const entry = slot.deref();
    return entry !== undefined && !entry.released;
  }).length;
};

/** Distinct private validation compilers reachable from live registrations. */
const liveCompilers = (ajv: Ajv): number => {
  const ledger = Reflect.get(globalThis, KEY).get(ajv);
  const compilers = new Set<unknown>();
  for (const slot of ledger.active) {
    const entry = slot.deref();
    if (entry && !entry.released) compilers.add(entry.validation);
  }
  return compilers.size;
};

const collectGarbage = async () => {
  setFlagsFromString('--expose_gc');
  const gc = runInNewContext('gc');
  for (let index = 0; index < 8; index++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    gc();
  }
  await new Promise((resolve) => setTimeout(resolve, 20));
};

/** A module-level schema constant, alive for the whole application. */
const SCHEMA: JSONSchema = {
  $id: 'https://r6-ownership.invalid/route',
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
};

it('FP5: collected per-route adapters do not keep their registrations of a long-lived root', async () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const shared = createValidator(ajv);
  await shared.compile(SCHEMA)({ name: 'ab' });
  const baseline = liveRegistrations(ajv);
  const references: WeakRef<object>[] = [];
  const visit = async () => {
    const adapter = createValidator(ajv);
    await adapter.compile(SCHEMA)({ name: 'ab' });
    references.push(new WeakRef(adapter));
  };
  for (let index = 0; index < 40; index++) await visit();
  await collectGarbage();
  const survivors = references.filter((reference) => reference.deref()).length;
  // Expected: nothing owns the per-route registrations of collected adapters any more.
  expect({
    survivors,
    live: liveRegistrations(ajv) - baseline,
    compilers: liveCompilers(ajv),
  }).toEqual({
    survivors,
    live: survivors,
    compilers: 1,
  });
});
