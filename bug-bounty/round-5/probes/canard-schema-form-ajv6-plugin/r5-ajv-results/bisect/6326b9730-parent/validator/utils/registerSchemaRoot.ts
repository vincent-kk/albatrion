/// <reference lib="es2021.weakref" preserve="true" />
import type Ajv from 'ajv';

import { PLUGIN_KEY_PREFIX, cloneInstance } from './cloneInstance';
import { createWeakReference } from './createWeakReference';
import { instanceIdRegistrationsOf } from './instanceIdRegistrationsOf';

/** Ajv instances and key retained for one authored root identity. */
export interface SchemaRootRegistration {
  /** Direct schemas are owned and released with this root's guard instance. */
  readonly directGuards: (object | boolean)[];
  /** Self-containment is computed once per object in this bound profile. */
  readonly guardChecks: WeakMap<object, boolean>;
  /** Base instance this root was registered against; `$id` conflicts are tracked per base. */
  readonly base: Ajv.Ajv;
  readonly validation: Ajv.Ajv;
  guard?: Ajv.Ajv;
  readonly key: string;
  readonly rootId: string;
  readonly ids: readonly string[];
  readonly validationCopy?: object;
  /** Whether `validationCopy` is registered on `validation`; set only by a successful `registerValidationRoot`. */
  validationRegistered: boolean;
  /** Exact registry values added by this registration; replaced application entries survive release. */
  validationOwnership?: {
    /** Schema environment originally registered under the plugin key. */
    readonly environment: unknown;
    /** Reference entries absent before this registration. */
    readonly refs: readonly (readonly [string, unknown])[];
    /** Whether the environment was absent from the application's schema registry. */
    readonly isCacheOwned: boolean;
  };
  guardCopy?: object;
}

/** Record one copy, leaving its guard instance, its validation registration and the ID-free validation cache empty. */
export const registerSchemaRoot = (
  root: object,
  instance: Ajv.Ajv,
  roots: WeakMap<object, SchemaRootRegistration>,
  active: Pick<WeakRef<SchemaRootRegistration>, 'deref'>[],
  finalizer: FinalizationRegistry<SchemaRootRegistration> | undefined,
): SchemaRootRegistration => {
  const previous = roots.get(root);
  if (previous) return previous;
  const ids: string[] = [];
  JSON.stringify(root, (name, value: unknown) => {
    if (name === '$id' && typeof value === 'string') ids.push(value);
    return value;
  });
  if (ids.length)
    for (let index = active.length - 1; index >= 0; index--)
      if (!active[index].deref()) active.splice(index, 1);
  const allRegistrations = instanceIdRegistrationsOf(instance);
  const shared: Pick<WeakRef<SchemaRootRegistration>, 'deref'>[] = ids.length
    ? allRegistrations
    : [];
  for (let index = shared.length - 1; index >= 0; index--)
    if (!shared[index].deref()) shared.splice(index, 1);
  const conflict = ids.some(
    (id) =>
      active.some((ref) => ref.deref()?.ids.includes(id)) ||
      shared.some((ref) => ref.deref()?.ids.includes(id)),
  );
  const validation = conflict
    ? cloneInstance(
        instance,
        !!instance._opts.allErrors,
        instance._opts.validateSchema,
        { jsonPointers: true, errorDataPath: 'object' },
      )
    : instance;
  const key = `${PLUGIN_KEY_PREFIX}${++allRegistrations.nextKey}`;
  const validationCopy: object | undefined = ids.length
    ? JSON.parse(JSON.stringify(root))
    : undefined;
  const rootId = '$id' in root && typeof root.$id === 'string' ? root.$id : key;
  const registration: SchemaRootRegistration = {
    base: instance,
    validation,
    key,
    rootId,
    ids,
    validationCopy,
    validationRegistered: false,
    directGuards: [],
    guardChecks: new WeakMap(),
  };
  roots.set(root, registration);
  finalizer?.register(root, registration, registration);
  if (ids.length) {
    const ref = createWeakReference(registration);
    active.push(ref);
    shared.push(ref);
  }
  return registration;
};
