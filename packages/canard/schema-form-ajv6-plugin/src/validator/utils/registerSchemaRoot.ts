import type Ajv from 'ajv';

/** Ajv instances and key retained for one authored root identity. */
export interface SchemaRootRegistration {
  /** Authored root used as the registration identity. */
  readonly root: object;
  /** Full validation instance containing this root. */
  readonly validation: Ajv.Ajv;
  /** Synchronous first-error instance containing this root. */
  readonly guard: Ajv.Ajv;
  /** Unique registration key independent of authored $id. */
  readonly key: string;
  /** IDs occupying the primary instance until release. */
  readonly ids: readonly string[];
}

/** Clone a bound Ajv 6 profile, including formats and custom keywords added after construction. */
const cloneInstance = (instance: Ajv.Ajv, allErrors: boolean): Ajv.Ajv => {
  const Constructor = instance.constructor as typeof Ajv;
  const clone = new Constructor({ ...instance._opts, allErrors });
  const source = instance as Ajv.Ajv & {
    _formats: Record<string, Parameters<Ajv.Ajv['addFormat']>[1]>;
    RULES: {
      custom: Record<string, { definition: Ajv.KeywordDefinition }>;
      keywords: Record<string, boolean>;
    };
  };
  for (const [name, format] of Object.entries(source._formats))
    clone.addFormat(name, format);
  for (const name of Object.keys(source.RULES.custom)) {
    if (clone.getKeyword(name)) continue;
    clone.addKeyword(name, source.RULES.custom[name].definition);
  }
  for (const name of Object.keys(source.RULES.keywords))
    if (!clone.getKeyword(name))
      clone.addKeyword(name, undefined as unknown as Ajv.KeywordDefinition);
  return clone;
};

/** Register a root once, isolating an overlapping $id on a matching Ajv profile. */
export const registerSchemaRoot = (
  root: object,
  instance: Ajv.Ajv,
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
  const validation = conflict ? cloneInstance(instance, Boolean(instance._opts.allErrors)) : instance;
  const guard = cloneInstance(instance, false);
  const key = `urn:canard:schema-form:ajv6:${++nextSchemaRootKey}`;
  validation.addSchema(root, key);
  guard.addSchema(root, key);
  const registration = { root, validation, guard, key, ids };
  roots.set(root, registration);
  active.push(registration);
  return registration;
};

/** Monotonic key counter prevents collisions with Ajv registrations across binds. */
let nextSchemaRootKey = 0;
