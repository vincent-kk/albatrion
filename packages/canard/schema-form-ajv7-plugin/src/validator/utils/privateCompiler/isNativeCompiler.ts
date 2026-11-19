import type { AjvInstance as Ajv } from '../../types/AjvInstance';

/**
 * Narrow a constructed value only after checking its native class and isolated registries.
 * @param value - Candidate returned by the application constructor.
 * @param source - Application instance that must not share mutable compilation registries.
 * @returns Whether the candidate honors the native class and independent-registry contract.
 */
export const isNativeCompiler = (value: unknown, source: Ajv): value is Ajv => {
  if (
    !value ||
    typeof value !== 'object' ||
    value === source ||
    !(value instanceof source.constructor)
  )
    return false;
  if (
    !('opts' in value) ||
    !value.opts ||
    typeof value.opts !== 'object' ||
    Reflect.get(value.opts, 'meta') !== false
  )
    return false;
  return (
    'schemas' in value &&
    value.schemas !== source.schemas &&
    'refs' in value &&
    value.refs !== source.refs &&
    'compile' in value &&
    typeof value.compile === 'function'
  );
};
