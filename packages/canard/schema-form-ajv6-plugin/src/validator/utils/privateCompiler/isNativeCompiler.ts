import type { Ajv } from 'ajv';

/**
 * Accept only the bound native class with independently owned schema registries.
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
    !('_opts' in value) ||
    !value._opts ||
    typeof value._opts !== 'object' ||
    Reflect.get(value._opts, 'meta') !== false
  )
    return false;
  for (const key of ['_cache', '_compilations', 'scope', '_opts', 'opts']) {
    const owned = Reflect.get(source, key);
    if (owned && typeof owned === 'object' && Reflect.get(value, key) === owned)
      return false;
  }
  return (
    '_schemas' in value &&
    value._schemas !== source._schemas &&
    '_refs' in value &&
    value._refs !== source._refs &&
    'compile' in value &&
    typeof value.compile === 'function'
  );
};
