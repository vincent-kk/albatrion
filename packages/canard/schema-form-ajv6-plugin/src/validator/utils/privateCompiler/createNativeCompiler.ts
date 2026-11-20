import type { Ajv, Options } from 'ajv';

import { instanceIdRegistrationsOf } from '../instanceIdRegistrationsOf';
import { copyNativeRules } from './copyNativeRules';
import { installPrivateResolver } from './installPrivateResolver';
import { isNativeCompiler } from './isNativeCompiler';
import { observeIdentity } from './observeIdentity';
import type { PrivateCompiler } from './types';

/**
 * Construct a detached identity-cache compiler with normalized JSON Pointer errors.
 * @param source - Application constructor and live profile; bootstrap registrations are excluded.
 * @param kind - Validation, guard or meta namespace with independent generated code.
 * @param allErrors - Error collection policy selected for this private environment.
 * @param validateSchema - Native schema-validation policy after detached bootstrap construction.
 * @returns An isolated lazy-import environment; throws a clear isolation error for unsupported constructors.
 */
export const createNativeCompiler = (
  source: Ajv,
  kind: PrivateCompiler['kind'],
  allErrors: boolean,
  validateSchema: PrivateCompiler['validateSchema'],
): PrivateCompiler => {
  const cache = Object.assign(new Map<unknown, unknown>(), {
    put: Map.prototype.set,
    del: Map.prototype.delete,
  });
  const options: Options = {
    ...source._opts,
    meta: false,
    $data: false,
    nullable: false,
    validateSchema: false,
    serialize: false,
    cache,
    allErrors,
    jsonPointers: true,
    errorDataPath: 'object',
    _errorDataPathProperty: false,
  };
  for (const key of ['schemas', 'keywords', 'formats'])
    Reflect.deleteProperty(options, key);
  let candidate: unknown;
  try {
    candidate = Reflect.construct(source.constructor, [options]);
  } catch (cause) {
    throw new Error(
      `AJV isolation compiler creation failed: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }
  if (
    !isNativeCompiler(candidate, source) ||
    Object.keys(candidate._schemas).length ||
    Object.keys(candidate._refs).length
  )
    throw new Error(
      'AJV isolation compiler creation failed: the constructor must honor empty compiler options',
    );
  const instance = candidate;
  Object.defineProperties(instance, {
    RULES: { value: copyNativeRules(source.RULES), configurable: true },
    _formats: { value: { ...source._formats }, configurable: true },
  });
  Object.assign(instance._opts, source._opts, {
    schemas: undefined,
    keywords: undefined,
    formats: undefined,
    cache,
    serialize: false,
    meta:
      typeof source._opts.meta === 'object'
        ? JSON.parse(JSON.stringify(source._opts.meta))
        : source._opts.meta,
    allErrors,
    validateSchema,
    jsonPointers: true,
    errorDataPath: 'object',
    _errorDataPathProperty: false,
  });
  instance._metaOpts = { ...instance._opts, validateSchema: false };
  const omitted = new Set([
    'schemas',
    'keywords',
    'formats',
    'cache',
    'serialize',
  ]);
  const ledger = instanceIdRegistrationsOf(source);
  const identities = (ledger.identities ??= new WeakMap());
  const optionKeys = Object.keys(source._opts);
  const compiler: PrivateCompiler = {
    instance,
    source,
    identities,
    kind,
    allErrors,
    validateSchema,
    options: Object.entries(source._opts)
      .filter(([key]) => !omitted.has(key))
      .map(([key, value]): readonly [string, unknown] => [
        key,
        observeIdentity(identities, value),
      ]),
    optionCount: optionKeys.length,
    optionKeys,
    entries: new Map(),
    rules: new Map(),
    formats: new Map(),
    imported: new Set(),
    claims: new Map(),
    copies: new WeakMap(),
    asynchronous: false,
    retired: false,
    count: 0,
  };
  installPrivateResolver(compiler);
  return compiler;
};
