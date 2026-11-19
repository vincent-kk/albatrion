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
  const { meta, ...pathOptions } = compilerOptions ?? {};
  const options: Ajv.Options = {
    ...instance._opts,
    cache: undefined,
    allErrors,
    validateSchema,
    ...pathOptions,
    ...(compilerOptions?.errorDataPath === 'object'
      ? { _errorDataPathProperty: false }
      : {}),
  };
  const { nullable, ...otherOptions } = options;
  const metaOption = meta === undefined ? {} : { meta };
  const clone = new Constructor(reuseNullable
    ? { nullable: nullable === true ? false : nullable, ...otherOptions, ...metaOption }
    : { ...options, ...metaOption });
  if (reuseNullable) {
    // Constructor-only flags do not enter the live data compilation profile.
    options.loopRequired = clone._opts.loopRequired;
    options.serialize = clone._opts.serialize;
    clone._opts = options;
    const metaOptions = { ...options };
    delete metaOptions.removeAdditional;
    delete metaOptions.useDefaults;
    delete metaOptions.coerceTypes;
    clone._metaOpts = metaOptions;
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
