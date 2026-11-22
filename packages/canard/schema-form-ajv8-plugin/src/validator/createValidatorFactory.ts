/// <reference lib="es2021.weakref" preserve="true" />
import type { JSONSchema } from '@canard/schema-form';
import type { Ajv } from 'ajv';

import { createValidationCompiler } from './createValidationCompiler';
import type { SchemaRootRegistry as CompilerRootRegistry } from './utils/registerSchemaRoot';

/** Registration shape carried by the beta factory's optional argument. */
interface SchemaRootRegistration {
  readonly directGuards: (object | boolean)[];
  readonly guardChecks: WeakMap<object, boolean>;
  readonly baseAjv: Ajv;
  readonly validationAjv: Ajv;
  guardAjv?: Ajv;
  readonly validationCopy?: JSONSchema;
  guardCopy?: JSONSchema;
  validationRefs: readonly string[];
  validationRegistered: boolean;
  guardRefs?: readonly string[];
  readonly key: string;
  readonly ids: readonly string[];
  readonly hasDynamicKeywords: boolean;
}

/** The beta factory's registry object, retained as its public argument type. */
interface SchemaRootRegistry {
  readonly entries: WeakMap<JSONSchema, SchemaRootRegistration[]>;
  readonly active: WeakRef<SchemaRootRegistration>[];
  readonly finalizer: FinalizationRegistry<SchemaRootRegistration>;
  compilerBase?: Ajv;
  compilerCurrent?: Ajv;
  compilerCount: number;
}

/** Keep private roots under the caller's registry identity without changing its entries. */
const factoryRoots = new WeakMap<
  SchemaRootRegistry['entries'],
  CompilerRootRegistry
>();

/**
 * Creates an asynchronous validator for an isolated schema root.
 * @param ajv - The active AJV instance whose options and extensions define validation.
 * @param registry - Optional beta registry whose entries identify shared registrations.
 * @returns A compiler that preserves the authored schema and normalizes failures.
 * @throws ValidatorBindRefusedError if the instance can modify the input.
 */
export const createValidatorFactory = (
  ajv: Ajv,
  registry?: SchemaRootRegistry,
) => {
  if (registry === undefined)
    return createValidationCompiler(ajv, new WeakMap());
  const { entries } = registry;
  if (typeof entries?.get !== 'function')
    throw new TypeError('registry.entries.get is not a function');

  const roots = factoryRoots.get(entries) ?? new WeakMap();
  const compile = createValidationCompiler(ajv, roots);
  factoryRoots.set(entries, roots);
  return compile;
};
