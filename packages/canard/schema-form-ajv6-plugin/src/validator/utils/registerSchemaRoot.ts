import type { JSONSchema } from '@canard/schema-form';
import type AjvModule from 'ajv';

type Ajv = AjvModule.Ajv;

import { cloneInstance } from './cloneInstance';
import { readApplicationProfile } from './readApplicationProfile';

/** Captured native table entries used to detect additions, removals and replacements. */
type ProfileImage = readonly (readonly [string, unknown][])[];

/** Holds only the latest native configuration for an application. */
interface ApplicationProfile {
  readonly image: ProfileImage;
  validation?: { readonly compiler: Ajv; readonly refs: Record<string, unknown>; readonly schemas: Record<string, unknown>; readonly fragments: Record<string, unknown>; };
}

const profiles = new WeakMap<Ajv, ApplicationProfile>();
let nextRootKey = 0;

/** Guard compiler and detached schema owned by one adapter and authored root. */
interface GuardRoot {
  readonly profile: ApplicationProfile;
  readonly compiler: Ajv;
  readonly snapshot: string;
  readonly copy: JSONSchema;
  readonly key: string;
  readonly rootId: string;
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
  if (!profile || !isCurrent(tables, profile.image)) {
    profile = { image: tables.map(Object.entries) };
    profiles.set(instance, profile);
  }
  const snapshot = JSON.stringify(root);
  const entry = registry.get(root) ?? {};
  if (guard) {
    const previous = entry.guard;
    const current = previous?.profile === profile && previous.snapshot === snapshot ? previous : undefined;
    const compiler = current?.compiler ?? cloneInstance(instance, 'guard');
    const copy: JSONSchema = current?.copy ?? JSON.parse(snapshot);
    const key = current?.key ?? `urn:canard:schema-form:ajv6:${++nextRootKey}`;
    const id = copy[compiler._opts.schemaId === 'id' || (compiler._opts.schemaId === 'auto' && typeof copy.id === 'string') ? 'id' : '$id'];
    const state = current ?? {
      profile, compiler, snapshot, copy, key, rootId: typeof id === 'string' && id ? id : key,
      guardChecks: new WeakMap(), isRegistered: false,
    };
    const result = guard(state, () => {
      if (state.isRegistered) return;
      const { compiler, copy, key } = state;
      compiler.addSchema(copy, key);
      state.isRegistered = true;
    });
    entry.guard = state;
    registry.set(root, entry);
    return result;
  }
  const previous = entry.validation;
  if (previous?.profile === profile && previous.snapshot === snapshot) return previous.validate;
  let pool = profile.validation;
  if (!(pool)) {
    const compiler = cloneInstance(instance, 'validation');
    pool = { compiler, refs: { ...compiler._refs }, schemas: { ...compiler._schemas }, fragments: {...compiler._fragments} };
  }
  // A native keyword compile callback can reenter while this compiler holds form addresses.
  profile.validation = undefined;
  const { compiler } = pool;
  const copy: JSONSchema = JSON.parse(snapshot);
  const id = copy[compiler._opts.schemaId === 'id' || (compiler._opts.schemaId === 'auto' && typeof copy.id === 'string') ? 'id' : '$id'];
  const key = `urn:canard:schema-form:ajv6:${++nextRootKey}`;
  let validate: NativeValidator | undefined;
  try {
    if (typeof id === 'string' && id) {
      const address = id.replace(/#\/?$/, '');
      const existing = compiler._schemas[address] ?? compiler._refs[address];
      const serialize = instance._opts.serialize;
      if (typeof existing === 'object' && !existing.meta && typeof serialize === 'function' &&
          serialize(existing.schema) === serialize(copy)) compiler.removeSchema(address);
      copy.$async = true;
      compiler.addSchema(copy, key);
      validate = compiler.getSchema(key);
    } else {
      copy.$async = true;
      validate = compiler.compile(copy);
    }
  } finally {
    compiler.removeSchema(copy);
    restoreRegistry(compiler._schemas, pool.schemas);
    restoreRegistry(compiler._refs, pool.refs);
    restoreRegistry(compiler._fragments, pool.fragments);
    profile.validation ??= pool;
  }
  if (!validate) throw new Error(`Registered Ajv schema was not found: ${key}`);
  entry.validation = { profile, snapshot, validate };
  registry.set(root, entry);
  return validate;
}
