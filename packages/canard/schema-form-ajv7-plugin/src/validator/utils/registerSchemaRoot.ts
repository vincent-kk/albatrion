/// <reference lib="es2021.weakref" />

import type Ajv from 'ajv';

import { cloneInstance, PLUGIN_KEY_PREFIX } from './cloneInstance';

/** Provisional cap: Ajv's code scope keeps functions after removeSchema. */
const MAX_TRANSIENT_ROOTS = 64;

/** Ajv instances and registration key retained for one root identity. */
export interface SchemaRootRegistration {
  /** Direct schemas are owned and released with this root's guard instance. */
  readonly directGuards: (object | boolean)[];
  /** Self-containment is computed once per object in this bound profile. */
  readonly guardChecks: WeakMap<object, boolean>;
  readonly validation: Ajv;
  guard?: Ajv;
  readonly key: string;
  readonly rootId: string;
  readonly ids: readonly string[];
  readonly validationCopy?: object;
  guardCopy?: object;
}

/** A bounded shared compiler for ID-free roots on one binding. */
export interface SchemaCompilerPool {
  readonly base: Ajv;
  current: Ajv;
  count: number;
}

/** Monotonic keys avoid collisions with registrations retained across binds. */
let nextSchemaRootKey = 0;

/** Register one copy, leaving its guard instance and ID-free validation cache empty. */
export const registerSchemaRoot = (
  root: object,
  instance: Ajv,
  roots: WeakMap<object, SchemaRootRegistration>,
  active: WeakRef<SchemaRootRegistration>[],
  finalizer: FinalizationRegistry<SchemaRootRegistration>,
  pool: SchemaCompilerPool,
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
  if (!ids.length && pool.count === MAX_TRANSIENT_ROOTS) {
    pool.current = cloneInstance(pool.base, Boolean(pool.base.opts.allErrors));
    pool.count = 0;
  }
  const validation = conflict ? cloneInstance(instance, Boolean(instance.opts.allErrors))
    : ids.length ? instance : pool.current;
  if (!ids.length) pool.count++;
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
