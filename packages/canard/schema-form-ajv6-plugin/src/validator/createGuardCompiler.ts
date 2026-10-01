import type { SchemaRootRegistration } from './utils/registerSchemaRoot';

/** Compile a synchronous pointer reference in its registered root context. */
export const createGuardCompiler = (
  registration: SchemaRootRegistration,
  pointer: string,
): ((value: unknown) => boolean) => {
  const fragment = pointer.startsWith('#') ? pointer : `#${pointer}`;
  const guard = registration.guard;
  if (!guard) throw new Error('Ajv 6 guard root was not registered');
  const validate = guard.compile({ $ref: `${registration.rootId}${fragment}` });
  return (value) => {
    const result = validate(value);
    if (typeof result !== 'boolean')
      throw new TypeError('Ajv 6 guard must return a synchronous boolean');
    return result;
  };
};
