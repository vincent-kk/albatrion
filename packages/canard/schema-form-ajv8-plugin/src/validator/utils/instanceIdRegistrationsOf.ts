/// <reference lib="es2021.weakref" preserve="true" />
import type { Ajv } from 'ajv';

import { createFinalizer } from './createFinalizer';
import { disposeSchemaRoot } from './disposeSchemaRoot';
import type { PrivateCompiler } from './privateCompiler/types';
import type { SchemaRootRegistration } from './registerSchemaRoot';

/** Realm-shared ownership; a pool contains at most 64 detached root attempts. */
export interface InstanceIdRegistrations {
  readonly active: Pick<WeakRef<SchemaRootRegistration>, 'deref'>[];
  readonly finalizer: FinalizationRegistry<SchemaRootRegistration> | undefined;
  nextKey: number;
  readonly pool: {
    count: number;
    validation?: PrivateCompiler;
    guard?: PrivateCompiler;
  };
  meta?: PrivateCompiler;
}
/** Module evaluation shares metadata through a versioned realm symbol. */
const REGISTRATIONS_KEY = Symbol.for(
  '@canard/schema-form-ajv8-plugin/registrations/v2',
);
/** Weak keys never change or retain the application instance. */
const realm: typeof globalThis & {
  [REGISTRATIONS_KEY]?: WeakMap<Ajv, InstanceIdRegistrations>;
} = globalThis;
/** Shared ledger map is looked up once per evaluated copy. */
const registrationsByInstance =
  realm[REGISTRATIONS_KEY] ?? new WeakMap<Ajv, InstanceIdRegistrations>();
if (!realm[REGISTRATIONS_KEY])
  Object.defineProperty(realm, REGISTRATIONS_KEY, {
    value: registrationsByInstance,
  });

/** Read the exact application's ledger without altering application state. */
export const instanceIdRegistrationsOf = (
  instance: Ajv,
): InstanceIdRegistrations => {
  let ledger = registrationsByInstance.get(instance);
  if (!ledger) {
    ledger = {
      active: [],
      finalizer: createFinalizer(disposeSchemaRoot),
      nextKey: 0,
      pool: { count: 0 },
    };
    registrationsByInstance.set(instance, ledger);
  }
  return ledger;
};
