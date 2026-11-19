/// <reference lib="es2021.weakref" preserve="true" />
import type { Ajv } from 'ajv';

import type { SchemaRootRegistration } from './registerSchemaRoot';

/** One instance's weak ownership list and registration sequence, shared across evaluated copies. */
type InstanceIdRegistrations = Pick<
  WeakRef<SchemaRootRegistration>,
  'deref'
>[] & {
  /** Monotonic registration sequence within the shared AJV instance. */
  nextKey: number;
};

/** Module evaluation shares one realm WeakMap through Symbol.for; its keys are bound AJV instances. */
const REGISTRATIONS_KEY = Symbol.for(
  '@canard/schema-form-ajv8-plugin/registrations/v1',
);

/** Realm metadata keeps application instances unmodified and weakly held. */
const realm: typeof globalThis & {
  [REGISTRATIONS_KEY]?: WeakMap<Ajv, InstanceIdRegistrations>;
} = globalThis;
/** Cache the realm lookup once per evaluated copy, outside compilation paths. */
const registrationsByInstance =
  realm[REGISTRATIONS_KEY] ?? new WeakMap<Ajv, InstanceIdRegistrations>();
if (!realm[REGISTRATIONS_KEY])
  Object.defineProperty(realm, REGISTRATIONS_KEY, {
    value: registrationsByInstance,
  });

/**
 * Read ownership metadata shared by every compatible plugin copy using this AJV instance.
 * @param instance - Bound application instance; metadata does not alter its options or schemas.
 * @returns The instance's mutable weak ownership list and registration counter.
 */
export const instanceIdRegistrationsOf = (
  instance: Ajv,
): InstanceIdRegistrations => {
  let list = registrationsByInstance.get(instance);
  if (!list) {
    list = Object.assign([], { nextKey: 0 });
    registrationsByInstance.set(instance, list);
  }
  return list;
};
