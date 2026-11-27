import type { JSONSchema } from '@canard/schema-form';
import type Ajv from 'ajv';

import type { Fn } from '@aileron/declare';

import { GuardPointerNotSchemaError } from './utils/GuardPointerNotSchemaError';
import { isSelfContainedGuard } from './utils/isSelfContainedGuard';
import { registerSchemaRoot, type SchemaRootRegistry } from './utils/registerSchemaRoot';
import { resolveGuardSchema } from './utils/resolveGuardSchema';

/**
 * Compile a synchronous guard directly when context-free, otherwise in its root.
 * A direct guard registers no root; only a root-pointer guard registers the root copy on the
 * guard instance, which compiles without meta-schema validation.
 * @param instance - The bound instance whose profile the guard instance copies.
 * @param registry - Root registrations shared with full validation.
 * @param pointer - The guard's original JSON Pointer, optionally prefixed with #.
 * @param root - The engine copy containing the original subschema object.
 * @param directGuardCompile - Enable direct compilation of self-contained guards.
 * @returns An input-preserving predicate; asynchronous results are refused.
 * @throws GuardPointerNotSchemaError when the pointer does not locate a schema
 */
export const createGuardCompiler = (
  instance: Ajv.Ajv,
  registry: SchemaRootRegistry,
  pointer: string,
  root: JSONSchema,
  directGuardCompile: boolean,
) : Fn<[value: unknown], boolean> => registerSchemaRoot(registry, instance, root, (registration, register) => {
  const { copy, compiler: guard } = registration;
  const fragment = pointer.startsWith('#') ? pointer.replace(/^#%2f/i, '#/') : `#${pointer.replace(/[^A-Za-z0-9_~./-]/gu, encodeURIComponent)}`;
  const rootId = '$id' in root && typeof root.$id === 'string' ? root.$id : '';
  const located = resolveGuardSchema(copy, fragment);
  if (located === undefined)
    throw new GuardPointerNotSchemaError(rootId, pointer);
  const schema = directGuardCompile ? located : undefined;
  const direct =
    schema !== undefined &&
    !Object.prototype.hasOwnProperty.call(root, '$schema') &&
    isSelfContainedGuard(
      schema,
      registration.guardChecks,
      instance._opts.schemaId === 'id' || instance._opts.schemaId === 'auto',
    );
  if (!direct) register();
  const validate = guard.compile(
    direct ? schema : { $ref: `${registration.rootId}${fragment}` },
  );
  if (direct && '$async' in validate && validate.$async === true)
    throw new Error('async schema in sync schema');
  return (value) => {
    const result = validate(value);
    if (typeof result !== 'boolean')
      throw new TypeError('Ajv 6 guard must return a synchronous boolean');
    return result;
  };
});
