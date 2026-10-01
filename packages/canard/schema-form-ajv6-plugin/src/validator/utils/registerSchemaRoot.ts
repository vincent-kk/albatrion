/// <reference lib="es2021.weakref" />

import type Ajv from 'ajv';

import { cloneInstance, PLUGIN_KEY_PREFIX } from './cloneInstance';

/** Ajv instances and key retained for one authored root identity. */
export interface SchemaRootRegistration {
  /** Direct schemas are owned and released with this root's guard instance. */
  readonly directGuards: (object | boolean)[];
  /** Self-containment is computed once per object in this bound profile. */
  readonly guardChecks: WeakMap<object, boolean>;
  readonly validation: Ajv.Ajv;
  guard?: Ajv.Ajv;
  readonly key: string;
  readonly rootId: string;
  readonly ids: readonly string[];
  readonly validationCopy?: object;
  guardCopy?: object;
}

/** Monotonic key counter prevents collisions with Ajv registrations across binds. */
let nextSchemaRootKey = 0;

/** Register one copy, leaving its guard instance and ID-free validation cache empty. */
export const registerSchemaRoot = (
  root: object,
  instance: Ajv.Ajv,
  roots: WeakMap<object, SchemaRootRegistration>,
  active: WeakRef<SchemaRootRegistration>[],
  finalizer: FinalizationRegistry<SchemaRootRegistration>,
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
  const conflict = ids.some((id) => active.some((ref) => ref.deref()?.ids.includes(id)));
  const validation = conflict ? cloneInstance(instance, Boolean(instance._opts.allErrors)) : instance;
  const key = `${PLUGIN_KEY_PREFIX}${++nextSchemaRootKey}`;
  const validationCopy: object | undefined = ids.length
    ? JSON.parse(JSON.stringify(root)) : undefined;
  if (validationCopy) validation.addSchema(validationCopy, key);
  const rootId = '$id' in root && typeof root.$id === 'string' ? root.$id : key;
  const registration: SchemaRootRegistration = {
    validation, key, rootId, ids, validationCopy,
    directGuards: [], guardChecks: new WeakMap(),
  };
  roots.set(root, registration);
  finalizer.register(root, registration, registration);
  if (ids.length) active.push(new WeakRef(registration));
  return registration;
};
