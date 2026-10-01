import type { JSONSchema } from '@canard/schema-form';
import type Ajv from 'ajv';
import type { Options } from 'ajv';

/** One root's isolated validation and guard registrations. */
export interface SchemaRootRegistration {
  /** Instance supplied by the caller or selected by the plugin. */
  readonly baseAjv: Ajv;
  /** Instance that compiles the full schema. */
  readonly validationAjv: Ajv;
  /** Instance with `allErrors: false` for synchronous guards. */
  readonly guardAjv: Ajv;
  /** Validation copy used to remove its public and nested IDs on release. */
  readonly validationCopy: JSONSchema;
  /** Guard copy used to remove its public and nested IDs on release. */
  readonly guardCopy: JSONSchema;
  /** AJV reference addresses introduced by the validation root. */
  readonly validationRefs: readonly string[];
  /** AJV reference addresses introduced by the guard root. */
  readonly guardRefs: readonly string[];
  /** Unique address for this root inside each instance. */
  readonly key: string;
  /** Temporary root probes used when an `if` needs its dynamic root scope. */
  readonly probes: SchemaRootRegistration[];
}

/** Mutable registration ownership retained by one plugin entry point. */
export interface SchemaRootRegistry {
  /** Root identity maps to registrations made under each active binding. */
  readonly entries: Map<JSONSchema, SchemaRootRegistration[]>;
  /** Binding instances already used for a live or released root. */
  readonly usedBases: WeakSet<Ajv>;
  /** Monotonic key allocator, including after release. */
  nextId: number;
}

/**
 * Registers a deep copy once for each bound instance and authored root identity.
 * @param registry - The plugin's owned registrations and key allocator.
 * @param baseAjv - The currently bound AJV instance.
 * @param root - The authored schema whose IDs and keywords remain unchanged.
 * @returns Isolated instances and their unique root address.
 */
export const registerSchemaRoot = (
  registry: SchemaRootRegistry,
  baseAjv: Ajv,
  root: JSONSchema,
): SchemaRootRegistration => {
  const registrations = registry.entries.get(root) ?? [];
  const existing = registrations.find((entry) => entry.baseAjv === baseAjv);
  if (existing) return existing;

  const Constructor = baseAjv.constructor as new (options: Options) => Ajv;
  const makeSibling = (allErrors: boolean): Ajv => {
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

  const validationAjv = registry.usedBases.has(baseAjv) ? makeSibling(Boolean(baseAjv.opts.allErrors)) : baseAjv;
  registry.usedBases.add(baseAjv);
  const guardAjv = makeSibling(false);
  const key = `https://canard.invalid/ajv8/root/${++registry.nextId}`;
  const validationCopy = structuredClone(root);
  const guardCopy = structuredClone(root);
  const validationRefsBefore = Object.keys(validationAjv.refs);
  const guardRefsBefore = Object.keys(guardAjv.refs);
  validationAjv.addSchema(validationCopy, key);
  guardAjv.addSchema(guardCopy, key);
  const validationRefs = Object.keys(validationAjv.refs).filter((ref) => !validationRefsBefore.includes(ref));
  const guardRefs = Object.keys(guardAjv.refs).filter((ref) => !guardRefsBefore.includes(ref));
  const registration = { baseAjv, validationAjv, guardAjv, validationCopy, guardCopy, validationRefs, guardRefs, key, probes: [] };
  registrations.push(registration);
  registry.entries.set(root, registrations);
  return registration;
};
