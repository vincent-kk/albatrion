import type Ajv from 'ajv';
import type { Options } from 'ajv';

/** Ajv instances and registration key retained for one root identity. */
export interface SchemaRootRegistration {
  readonly root: object;
  readonly validation: Ajv;
  readonly guard: Ajv;
  readonly key: string;
  readonly ids: readonly string[];
}

/** Clone a bound Ajv 7 profile, including formats and custom keywords. */
const cloneInstance = (instance: Ajv, allErrors: boolean): Ajv => {
  const Constructor = instance.constructor as new (options?: Options) => Ajv;
  const clone = new Constructor({ ...instance.opts, allErrors });
  for (const [name, format] of Object.entries(instance.formats))
    if (format !== undefined) clone.addFormat(name, format);
  for (const name of Object.keys(instance.RULES.keywords)) {
    if (clone.getKeyword(name)) continue;
    const definition = instance.getKeyword(name);
    if (definition === true) clone.addKeyword(name);
    else if (definition) clone.addKeyword(definition);
  }
  return clone;
};

/** Register a root once, isolating overlapping IDs on a matching Ajv profile. */
export const registerSchemaRoot = (
  root: object,
  instance: Ajv,
  roots: WeakMap<object, SchemaRootRegistration>,
  active: SchemaRootRegistration[],
): SchemaRootRegistration => {
  const previous = roots.get(root);
  if (previous) return previous;
  const ids: string[] = [];
  JSON.stringify(root, (name, value: unknown) => {
    if (name === '$id' && typeof value === 'string') ids.push(value);
    return value;
  });
  const conflict = ids.some((id) =>
    active.some((registration) => registration.ids.includes(id)));
  const validation = conflict ? cloneInstance(instance, Boolean(instance.opts.allErrors)) : instance;
  const guard = cloneInstance(instance, false);
  const key = `urn:canard:schema-form:ajv7:${++nextSchemaRootKey}`;
  validation.addSchema(root, key);
  guard.addSchema(root, key);
  const registration = { root, validation, guard, key, ids };
  roots.set(root, registration);
  active.push(registration);
  return registration;
};

/** Monotonic keys avoid collisions with registrations retained across binds. */
let nextSchemaRootKey = 0;
