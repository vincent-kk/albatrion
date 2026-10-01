import type { SchemaRootRegistration } from './utils/registerSchemaRoot';
import { resolveGuardSchema } from './utils/resolveGuardSchema';
import { isSelfContainedGuard } from './utils/isSelfContainedGuard';

/**
 * Compile a synchronous guard directly when context-free, otherwise in its root.
 * @param registration - The first-error sibling and owner of compiled guards.
 * @param pointer - The guard's original JSON Pointer, optionally prefixed with #.
 * @param root - The engine copy containing the original subschema object.
 * @param directGuardCompile - Enable direct compilation of self-contained guards.
 * @param finalizer - Cleanup owner for roots whose resources cannot retain the root.
 * @returns An input-preserving predicate; asynchronous results are refused.
 */
export const createGuardCompiler = (
  registration: SchemaRootRegistration,
  pointer: string,
  root: object,
  directGuardCompile: boolean,
  finalizer: FinalizationRegistry<SchemaRootRegistration>,
): ((value: unknown) => boolean) => {
  const fragment = pointer.startsWith('#') ? pointer : `#${pointer}`;
  const guard = registration.guard;
  if (!guard) throw new Error('Ajv 6 guard root was not registered');
  const schema = directGuardCompile ? resolveGuardSchema(root, pointer) : undefined;
  const direct = schema !== undefined && isSelfContainedGuard(schema, registration.guardChecks, guard._opts.schemaId === 'id' || guard._opts.schemaId === 'auto');
  if (direct) {
    // A direct root would retain itself through the finalizer's held value.
    // Its ID-free, dedicated guard is collected with the weak root registration.
    if (schema === root) finalizer.unregister(registration);
    if (!registration.directGuards.includes(schema)) registration.directGuards.push(schema);
  }
  const validate = guard.compile(direct ? schema : { $ref: `${registration.rootId}${fragment}` });
  if (direct && '$async' in validate && validate.$async === true)
    throw new Error('async schema in sync schema');
  return (value) => {
    const result = validate(value);
    if (typeof result !== 'boolean')
      throw new TypeError('Ajv 6 guard must return a synchronous boolean');
    return result;
  };
};
