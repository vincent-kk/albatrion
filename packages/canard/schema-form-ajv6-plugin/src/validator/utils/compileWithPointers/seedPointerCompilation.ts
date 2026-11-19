import Ajv from 'ajv';

import { pointerCompilations, pointerCompilers } from '../pointerCompilerCache';
import type { SchemaRootRegistration } from '../registerSchemaRoot';
import { pointerCompilerOf } from './pointerCompilerOf';

/**
 * Reuse one native registration's resolved references without sharing its compiled program.
 * @param registration - Successfully registered root whose only added URI names its own environment.
 * @returns Nothing; unusual profiles and overlapping private resources keep native registration.
 */
export const seedPointerCompilation = (
  registration: SchemaRootRegistration,
): void => {
  const source = registration.validation;
  const copy = registration.validationCopy;
  const ownership = registration.validationOwnership;
  if (
    !copy ||
    !ownership ||
    source.constructor !== Ajv ||
    source.compile !== Ajv.prototype.compile ||
    source.addSchema !== Ajv.prototype.addSchema ||
    source.validateSchema !== Ajv.prototype.validateSchema ||
    typeof source._opts.meta === 'object' ||
    (source._opts.defaultMeta !== undefined &&
      source._opts.defaultMeta !== 'http://json-schema.org/draft-07/schema') ||
    source._opts.cache ||
    source._opts.addUsedSchema === false ||
    pointerCompilers.get(source) === source
  )
    return;
  const environment = source._schemas[registration.key];
  if (
    !environment ||
    environment !== ownership.environment ||
    typeof environment.id !== 'string' ||
    !environment.id ||
    typeof environment.cacheKey !== 'string' ||
    environment.localRefs === undefined ||
    environment.meta === true ||
    (typeof environment.schema === 'object' &&
      '$schema' in environment.schema &&
      environment.schema.$schema !== 'http://json-schema.org/draft-07/schema' &&
      environment.schema.$schema !==
        'http://json-schema.org/draft-07/schema#') ||
    ownership.refs.length !== 1 ||
    ownership.refs[0]?.[0] !== environment.id ||
    ownership.refs[0]?.[1] !== environment
  )
    return;
  const compiler = pointerCompilerOf(source);
  if (
    compiler._opts.serialize !== source._opts.serialize ||
    compiler._schemas[registration.key] !== undefined ||
    compiler._refs[environment.id] !== undefined ||
    compiler._cache.get(environment.cacheKey) !== undefined
  )
    return;
  const privateEnvironment = {
    id: environment.id,
    schema: environment.schema,
    localRefs: environment.localRefs,
    cacheKey: environment.cacheKey,
    meta: false,
  };
  compiler._schemas[registration.key] = privateEnvironment;
  compiler._refs[environment.id] = privateEnvironment;
  compiler._cache.put(environment.cacheKey, privateEnvironment);
  pointerCompilations.set(copy, {
    compiler,
    schema: environment.schema,
    seeded: {
      key: registration.key,
      id: environment.id,
      cacheKey: environment.cacheKey,
      environment: privateEnvironment,
    },
  });
};
