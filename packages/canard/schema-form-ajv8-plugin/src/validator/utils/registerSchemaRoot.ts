import type { JSONSchema } from '@canard/schema-form';
import type { Ajv } from 'ajv';

import { assertBindableInstance } from './assertBindableInstance';
import { makeSibling } from './makeSibling';
import { readApplicationProfile } from './readApplicationProfile';
import { readApplicationSchemaBodies } from './readApplicationSchemaBodies';

/** Captured native table entries used to detect additions, removals and replacements. */
type ProfileImage = readonly (readonly [string, unknown][])[];

/** Holds only the latest native configuration for an application. */
interface ApplicationProfile {
  readonly image: ProfileImage;
  readonly schemaBodies: ReturnType<typeof readApplicationSchemaBodies>;
  validation?: { readonly compiler: Ajv; readonly refs: Ajv['refs']; readonly schemas: Ajv['schemas']; count: number; };
}

const profiles = new WeakMap<Ajv, ApplicationProfile>();
/** AJV keeps generated scope values after a schema is removed. */
const MAX_COMPILER_ROOTS = 64;
let nextRootKey = 0;

/** Guard compiler and detached schema owned by one adapter and authored root. */
interface GuardRoot {
  readonly profile: ApplicationProfile;
  readonly compiler: Ajv;
  readonly snapshot: string;
  readonly copy: JSONSchema;
  readonly key: string;
  readonly hasDynamicKeywords: boolean;
  readonly guardChecks: WeakMap<object, boolean>;
  isRegistered: boolean;
}

type NativeValidator = NonNullable<ReturnType<Ajv['getSchema']>>;

/** Products retained while a caller holds the authored root and its adapter. */
interface RootEntry {
  guard?: GuardRoot;
  validation?: { profile: ApplicationProfile; snapshot: string; validate: NativeValidator };
}

/** Weak lifetime of detached compiles by authored root. */
export type SchemaRootRegistry = WeakMap<JSONSchema, RootEntry>;

const isCurrent = (tables: readonly object[], image: ProfileImage): boolean =>
  image.every((entries, index) => {
    const table = tables[index];
    const keys = Object.keys(table);
    return keys.length === entries.length && entries.every(
      ([key, value], index) => keys[index] === key && Reflect.get(table, key) === value,
    );
  });

/** Restore native addresses after a temporary registration without replacing the registry. */
const restoreRegistry = <T>(target: Record<string, T>, snapshot: Record<string, T>): void => {
  for (const key of Object.keys(target))
    if (!Object.prototype.hasOwnProperty.call(snapshot, key)) delete target[key];
  Object.assign(target, snapshot);
};

/**
 * Compiles against the current application profile without installing form addresses on it.
 * Contextual guards may install their detached root in a root-scoped compiler. Whole-root
 * compiles share a bounded compiler and roll its addresses back before returning.
 */
export function registerSchemaRoot(
  registry: SchemaRootRegistry, instance: Ajv, root: JSONSchema,
): NativeValidator;
export function registerSchemaRoot<T>(
  registry: SchemaRootRegistry, instance: Ajv, root: JSONSchema,
  guard: (root: GuardRoot, register: () => void) => T,
): T;
export function registerSchemaRoot<T>(
  registry: SchemaRootRegistry, instance: Ajv, root: JSONSchema,
  guard?: (root: GuardRoot, register: () => void) => T,
): NativeValidator | T {
  const tables = readApplicationProfile(instance);
  let profile = profiles.get(instance);
  if (!profile || !isCurrent(tables, profile.image) ||
      profile.schemaBodies?.some(([entry, body]) => JSON.stringify(entry.schema) !== body)) {
    assertBindableInstance(instance);
    profile = {
      image: tables.map(Object.entries),
      schemaBodies: readApplicationSchemaBodies(instance),
    };
    profiles.set(instance, profile);
  }
  const snapshot = JSON.stringify(root);
  const entry = registry.get(root) ?? {};
  if (guard) {
    const previous = entry.guard;
    const current = previous?.profile === profile && previous.snapshot === snapshot ? previous : undefined;
    const compiler = current?.compiler ?? makeSibling(instance, 'guard');
    const copy: JSONSchema = current?.copy ?? JSON.parse(snapshot);
    const key = current?.key ?? `https://canard.invalid/ajv8/root/${++nextRootKey}`;
    const id = copy.$id;
    const state = current ?? {
      profile, compiler, snapshot, copy, key,
      hasDynamicKeywords: /"\$(?:dynamicAnchor|recursiveAnchor|dynamicRef|recursiveRef)":/.test(snapshot),
      guardChecks: new WeakMap(), isRegistered: false,
    };
    const result = guard(state, () => {
      if (state.isRegistered) return;
      const { compiler, copy, key } = state;
      if (typeof id === 'string' && id) compiler.addSchema(copy, key);
      else {
        const emptySchema = compiler.schemas[''];
        const emptyRef = compiler.refs[''];
        delete compiler.schemas[''];
        delete compiler.refs[''];
        try {
          compiler.addSchema(copy);
          compiler.schemas[key] = compiler.schemas[''];
        } finally {
          if (emptySchema) compiler.schemas[''] = emptySchema;
          else delete compiler.schemas[''];
          if (emptyRef) compiler.refs[''] = emptyRef;
          else delete compiler.refs[''];
        }
      }
      state.isRegistered = true;
    });
    entry.guard = state;
    registry.set(root, entry);
    return result;
  }
  const previous = entry.validation;
  if (previous?.profile === profile && previous.snapshot === snapshot) return previous.validate;
  let pool = profile.validation;
  if (!(pool && pool.count < MAX_COMPILER_ROOTS)) {
    const compiler = makeSibling(instance, 'validation');
    pool = { compiler, refs: { ...compiler.refs }, schemas: { ...compiler.schemas }, count: 0 };
  }
  // A native keyword compile callback can reenter while this compiler holds form addresses.
  profile.validation = undefined;
  pool.count++;
  const { compiler } = pool;
  const copy: JSONSchema = JSON.parse(snapshot);
  copy.$async = true;
  const id = copy[compiler.opts.schemaId];
  const key = `https://canard.invalid/ajv8/root/${++nextRootKey}`;
  let validate: NativeValidator | undefined;
  try {
    if (typeof id === 'string' && id) {
      compiler.addSchema(copy, key);
      validate = compiler.getSchema(key);
    } else {
      validate = compiler.compile(copy);
    }
  } finally {
    compiler.removeSchema(copy);
    restoreRegistry(compiler.schemas, pool.schemas);
    restoreRegistry(compiler.refs, pool.refs);
    profile.validation ??= pool;
  }
  if (!validate) throw new Error(`Registered Ajv schema was not found: ${key}`);
  entry.validation = { profile, snapshot, validate };
  registry.set(root, entry);
  return validate;
}
