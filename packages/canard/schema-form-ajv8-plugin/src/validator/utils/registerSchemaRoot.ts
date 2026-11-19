/// <reference lib="es2021.weakref" preserve="true" />
import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type { Ajv } from 'ajv';

import { createWeakReference } from './createWeakReference';
import { disposeSchemaRoot } from './disposeSchemaRoot';
import { instanceIdRegistrationsOf } from './instanceIdRegistrationsOf';
import { isPrivateCompilerCurrent } from './privateCompiler/isPrivateCompilerCurrent';
import type { PrivateCompiler } from './privateCompiler/types';

/** Detached state whose lifetime follows a caller root held only as a WeakMap key. */
export interface SchemaRootRegistration {
  readonly baseAjv: Ajv;
  readonly copy: JSONSchema;
  readonly serialized: string;
  readonly key: string;
  readonly ids: readonly string[];
  readonly hasDynamicKeywords: boolean;
  readonly guardChecks: WeakMap<object, boolean>;
  readonly guards: Map<
    string,
    { compiler: PrivateCompiler; validate: (value: unknown) => boolean }
  >;
  readonly guardSchemas: {
    compiler: PrivateCompiler;
    schema: object | boolean;
  }[];
  validationMeta?: PrivateCompiler;
  validation?: PrivateCompiler;
  guard?: PrivateCompiler;
  validate?: ValidateFunction;
  released: boolean;
}
/** Adapter-local root identity selection; native resources belong to the instance ledger. */
export interface SchemaRootRegistry {
  readonly entries: WeakMap<JSONSchema, SchemaRootRegistration[]>;
}
/** Register one detached snapshot, pruning dead weak registrations before reserving state. */
export const registerSchemaRoot = (
  registry: SchemaRootRegistry,
  baseAjv: Ajv,
  root: JSONSchema,
): SchemaRootRegistration => {
  if (!root || typeof root !== 'object' || Array.isArray(root))
    throw new TypeError('A form schema root must be a JSON schema object');
  const registrations = registry.entries.get(root) ?? [];
  const existing = registrations.find((entry) => entry.baseAjv === baseAjv);
  const ids: string[] = [];
  let hasDynamicKeywords = false;
  const serialized = JSON.stringify(root, (name, value: unknown) => {
    if (name === '$id' && typeof value === 'string') ids.push(value);
    if (
      [
        '$dynamicAnchor',
        '$recursiveAnchor',
        '$dynamicRef',
        '$recursiveRef',
      ].includes(name)
    )
      hasDynamicKeywords = true;
    return value;
  });
  if (
    existing?.serialized === serialized &&
    (!existing.validation || isPrivateCompilerCurrent(existing.validation)) &&
    (!existing.guard || isPrivateCompilerCurrent(existing.guard)) &&
    (!existing.validationMeta ||
      isPrivateCompilerCurrent(existing.validationMeta))
  )
    return existing;
  const ledger = instanceIdRegistrationsOf(baseAjv);
  if (existing) {
    ledger.finalizer?.unregister(existing);
    disposeSchemaRoot(existing);
    registrations.splice(registrations.indexOf(existing), 1);
  }
  for (let index = ledger.active.length - 1; index >= 0; index--) {
    const entry = ledger.active[index].deref();
    if (!entry || entry.released) ledger.active.splice(index, 1);
  }
  const registration: SchemaRootRegistration = {
    baseAjv,
    copy: JSON.parse(serialized),
    serialized,
    key: `https://canard.invalid/ajv8/root/${++ledger.nextKey}`,
    ids,
    hasDynamicKeywords,
    guardChecks: new WeakMap(),
    guards: new Map(),
    guardSchemas: [],
    released: false,
  };
  registrations.push(registration);
  registry.entries.set(root, registrations);
  ledger.finalizer?.register(root, registration, registration);
  ledger.active.push(createWeakReference(registration));
  return registration;
};
