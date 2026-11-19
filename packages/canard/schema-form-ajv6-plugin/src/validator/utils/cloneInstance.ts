import type Ajv from 'ajv';

import { pointerCompilers } from './pointerCompilerCache';

/** Registration keys belong to this plugin and must not enter a sibling. */
export const PLUGIN_KEY_PREFIX = 'urn:canard:schema-form:ajv6:';

/**
 * Isolate schema caches while keeping the bound formats and keyword registries live.
 * @param instance - Bound instance whose options, formats, keywords and consumer schemas are copied
 * @param allErrors - Error collection of the clone
 * @param validateSchema - Schema validation of the clone; defaults to the bound instance's setting
 * @param errorPathOptions - Private validation profiles normalize paths without changing the source instance.
 * @returns A new instance of the bound instance's class
 */
export const cloneInstance = (
  instance: Ajv.Ajv,
  allErrors: boolean,
  validateSchema: Ajv.Options['validateSchema'] = instance._opts.validateSchema,
  errorPathOptions?: Pick<Ajv.Options, 'jsonPointers' | 'errorDataPath'>,
): Ajv.Ajv => {
  const Constructor = instance.constructor;
  const clone = new Constructor({
    ...instance._opts,
    cache: undefined,
    allErrors,
    validateSchema,
    ...errorPathOptions,
    ...(errorPathOptions?.errorDataPath === 'object'
      ? { _errorDataPathProperty: false }
      : {}),
  });
  if (
    (pointerCompilers.get(instance) === instance && !errorPathOptions) ||
    (errorPathOptions?.jsonPointers === true &&
      errorPathOptions.errorDataPath === 'object')
  )
    pointerCompilers.set(clone, clone);
  // Schema caches are isolated; future compiles read the bound instance's live rules.
  Object.defineProperties(clone, {
    _formats: { value: instance._formats },
    RULES: { value: instance.RULES },
  });
  for (const [key, env] of Object.entries(instance._schemas))
    if (
      env &&
      !key.startsWith(PLUGIN_KEY_PREFIX) &&
      !Object.prototype.hasOwnProperty.call(clone._schemas, key)
    )
      clone.addSchema(env.schema, key);
  return clone;
};
