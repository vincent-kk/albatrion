import type { JSONSchema } from '@canard/schema-form';
import type { Ajv } from 'ajv';

import type { Fn } from '@aileron/declare';

import { GuardPointerNotSchemaError } from './utils/GuardPointerNotSchemaError';
import { isSelfContainedGuard } from './utils/isSelfContainedGuard';
import { isPrivateCompilerCurrent } from './utils/privateCompiler/isPrivateCompilerCurrent';
import { selectRootCompiler } from './utils/privateCompiler/selectRootCompiler';
import {
  type SchemaRootRegistry,
  registerSchemaRoot,
} from './utils/registerSchemaRoot';
import { resolveGuardSchema } from './utils/resolveGuardSchema';

/**
 * Compiles a synchronous guard at a location in its registered root.
 * @param ajv - The active AJV instance supplying the guard's dialect and extensions.
 * @param registry - Root registrations shared with full validation.
 * @param root - The authored root that contains the guard.
 * @param pointer - An unfragmented JSON Pointer to the guard schema.
 * @param directGuardCompile - Compile self-contained guards directly when enabled.
 * @returns A boolean predicate evaluated without changing its input.
 * @throws GuardPointerNotSchemaError when the pointer does not locate a schema
 * @throws Error when the guard or a declaration selected as its dynamic anchor is asynchronous, or when the guard
 * references a dynamic anchor inline that no chain resource and no ancestor of the reference inside the guard declares
 */
export const createGuardCompiler = (
  ajv: Ajv,
  registry: SchemaRootRegistry,
  callerRoot: JSONSchema,
  pointer: string,
  directGuardCompile: boolean,
): Fn<[value: unknown], boolean> => {
  const registration = registerSchemaRoot(registry, ajv, callerRoot);
  const root = registration.copy;
  const cacheKey = `${directGuardCompile}:${pointer}`;
  const cached = registration.guards.get(cacheKey);
  if (cached && isPrivateCompilerCurrent(cached.compiler))
    return cached.validate;
  const rootId = typeof root.$id === 'string' ? root.$id : '';
  const located = resolveGuardSchema(root, pointer);
  if (located === undefined)
    throw new GuardPointerNotSchemaError(rootId, pointer);
  const schema = directGuardCompile ? located : undefined;
  if (
    schema !== undefined &&
    !Object.prototype.hasOwnProperty.call(root, '$schema') &&
    isSelfContainedGuard(
      schema,
      registration.guardChecks,
      ajv._opts.schemaId === 'id' || ajv._opts.schemaId === 'auto',
    )
  ) {
    const compiler = selectRootCompiler(registration, schema, 'guard');
    const validate = compiler.instance.compile(schema);
    registration.guardSchemas.push({ compiler, schema });
    if ('$async' in validate && validate.$async === true)
      throw new Error('async schema in sync schema');
    const predicate = (value: unknown) => !!validate(value);
    registration.guards.set(cacheKey, { compiler, validate: predicate });
    return predicate;
  }
  const compiler = selectRootCompiler(registration, root, 'guard');
  const guard = compiler.instance;
  if (!Object.prototype.hasOwnProperty.call(guard._schemas, registration.key)) {
    const guardCopy: JSONSchema = JSON.parse(JSON.stringify(root));
    guard.addSchema(guardCopy, registration.key, true);
    registration.guardSchemas.push({ compiler, schema: guardCopy });
  }
  const fragment = pointer.includes('%')
    ? pointer.replace(/%/g, '%25')
    : pointer;
  const validate = guard.compile({ $ref: `${registration.key}#${fragment}` });
  if ('$async' in validate && validate.$async)
    throw new Error('async schema in sync schema');
  return (value) => {
    const result = validate(value);
    if (typeof result !== 'boolean')
      throw new TypeError('Ajv 6 guard must return a synchronous boolean');
    return result;
  };
};
