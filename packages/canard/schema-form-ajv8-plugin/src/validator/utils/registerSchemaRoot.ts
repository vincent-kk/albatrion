/// <reference lib="es2021.weakref" />

import type { JSONSchema } from '@canard/schema-form';
import type Ajv from 'ajv';
import type { Options } from 'ajv';

/** Ajv's code scope keeps functions after removeSchema; cap one shared compiler's roots. */
const MAX_TRANSIENT_ROOTS = 64;

/** One root's validation and optional guard registrations. */
export interface SchemaRootRegistration {
  readonly baseAjv: Ajv;
  readonly validationAjv: Ajv;
  guardAjv?: Ajv;
  readonly validationCopy?: JSONSchema;
  guardCopy?: JSONSchema;
  readonly validationRefs: readonly string[];
  guardRefs?: readonly string[];
  readonly key: string;
  readonly ids: readonly string[];
  readonly probes: SchemaRootRegistration[];
}

/** Mutable registration ownership retained by one plugin entry point. */
export interface SchemaRootRegistry {
  readonly entries: WeakMap<JSONSchema, SchemaRootRegistration[]>;
  readonly active: WeakRef<SchemaRootRegistration>[];
  readonly finalizer: FinalizationRegistry<SchemaRootRegistration>;
  compilerBase?: Ajv;
  compilerCurrent?: Ajv;
  compilerCount: number;
  nextId: number;
}

/** Clone a bound profile, including consumer formats and custom keywords. */
const makeSibling = (baseAjv: Ajv, allErrors: boolean): Ajv => {
  const Constructor = baseAjv.constructor as new (options: Options) => Ajv;
  const sibling = new Constructor({ ...baseAjv.opts, allErrors });
  for (const [name, format] of Object.entries(baseAjv.formats))
    if (format !== undefined) sibling.addFormat(name, format);
  for (const name of Object.keys(baseAjv.RULES.all)) {
    if (sibling.getKeyword(name)) continue;
    const keyword = baseAjv.getKeyword(name);
    if (typeof keyword === 'object') sibling.addKeyword(keyword);
  }
  return sibling;
};

/** Registers a copy once for each bound instance and authored root identity. */
export const registerSchemaRoot = (
  registry: SchemaRootRegistry,
  baseAjv: Ajv,
  root: JSONSchema,
): SchemaRootRegistration => {
  const registrations = registry.entries.get(root) ?? [];
  const existing = registrations.find((entry) => entry.baseAjv === baseAjv);
  if (existing) return existing;
  const ids: string[] = [];
  JSON.stringify(root, (name, value: unknown) => {
    if (name === '$id' && typeof value === 'string') ids.push(value);
    return value;
  });
  if (ids.length)
    for (let index = registry.active.length - 1; index >= 0; index--)
      if (!registry.active[index].deref()) registry.active.splice(index, 1);
  const conflict = ids.some((id) => registry.active.some((ref) => {
    const entry = ref.deref();
    return entry?.baseAjv === baseAjv && entry.ids.includes(id);
  }));
  if (!ids.length && registry.compilerBase !== baseAjv) {
    registry.compilerBase = baseAjv;
    registry.compilerCurrent = baseAjv;
    registry.compilerCount = 0;
  }
  if (!ids.length && registry.compilerCount === MAX_TRANSIENT_ROOTS) {
    registry.compilerCurrent = makeSibling(baseAjv, Boolean(baseAjv.opts.allErrors));
    registry.compilerCount = 0;
  }
  const validationAjv = conflict ? makeSibling(baseAjv, Boolean(baseAjv.opts.allErrors))
    : ids.length ? baseAjv : registry.compilerCurrent ?? baseAjv;
  if (!ids.length) registry.compilerCount++;
  const key = `https://canard.invalid/ajv8/root/${++registry.nextId}`;
  const validationCopy = ids.length ? structuredClone(root) : undefined;
  const validationRefsBefore = validationCopy ? Object.keys(validationAjv.refs) : [];
  if (validationCopy) validationAjv.addSchema(validationCopy, key);
  const validationRefs = validationCopy
    ? Object.keys(validationAjv.refs).filter((ref) => !validationRefsBefore.includes(ref)) : [];
  const registration: SchemaRootRegistration = {
    baseAjv, validationAjv, validationCopy, validationRefs, key, ids, probes: [],
  };
  registrations.push(registration);
  registry.entries.set(root, registrations);
  registry.finalizer.register(root, registration, registration);
  if (ids.length) registry.active.push(new WeakRef(registration));
  return registration;
};

/** Materialize a first-error sibling only when a guard is requested. */
export const registerSchemaGuard = (
  baseAjv: Ajv,
  root: JSONSchema,
  registration: SchemaRootRegistration,
): Ajv => {
  if (registration.guardAjv) return registration.guardAjv;
  const guardAjv = makeSibling(baseAjv, false);
  const guardCopy = structuredClone(root);
  const refsBefore = Object.keys(guardAjv.refs);
  guardAjv.addSchema(guardCopy, registration.key);
  registration.guardAjv = guardAjv;
  registration.guardCopy = guardCopy;
  registration.guardRefs = Object.keys(guardAjv.refs).filter((ref) => !refsBefore.includes(ref));
  return guardAjv;
};
