import Ajv from 'ajv';

import { pointerCompilers } from './pointerCompilerCache';

/** Registration keys belong to this plugin and must not enter a sibling. */
export const PLUGIN_KEY_PREFIX = 'urn:canard:schema-form:ajv6:';

/**
 * Isolate schema caches while keeping the bound formats and keyword registries live.
 * @param instance - Bound instance whose options, formats, keywords and consumer schemas are copied
 * @param allErrors - Error collection of the clone
 * @param validateSchema - Schema validation of the clone; defaults to the bound instance's setting
 * @param compilerOptions - Private data profiles normalize paths and can leave meta-schema validation to the source.
 * @returns A new instance of the bound instance's class
 */
export const cloneInstance = (
  instance: Ajv.Ajv,
  allErrors: boolean,
  validateSchema: Ajv.Options['validateSchema'] = instance._opts.validateSchema,
  compilerOptions?: Pick<Ajv.Options, 'jsonPointers' | 'errorDataPath' | 'meta'>,
): Ajv.Ajv => {
  const Constructor = instance.constructor;
  const reuseNullable = compilerOptions?.meta === false && Constructor === Ajv;
  const clone = new Constructor({
    ...instance._opts,
    cache: undefined,
    allErrors,
    validateSchema,
    ...compilerOptions,
    ...(reuseNullable ? { nullable: false } : {}),
    ...(compilerOptions?.errorDataPath === 'object'
      ? { _errorDataPathProperty: false }
      : {}),
  });
  if (reuseNullable) {
    // The live source RULES supply the nullable keyword's compiled meta-schema.
    clone._opts.nullable = instance._opts.nullable;
    clone._metaOpts.nullable = instance._opts.nullable;
  }
  if (
    (pointerCompilers.get(instance) === instance && !compilerOptions) ||
    (compilerOptions?.jsonPointers === true &&
      compilerOptions.errorDataPath === 'object')
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
      !(compilerOptions?.meta === false && env.meta) &&
      !key.startsWith(PLUGIN_KEY_PREFIX) &&
      !Object.prototype.hasOwnProperty.call(clone._schemas, key)
    )
      clone.addSchema(env.schema, key);
  return clone;
};
